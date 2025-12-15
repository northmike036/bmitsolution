import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1️⃣ Auth
    if (!session || session.user.type !== "root") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // 2️⃣ Prevent self-delete
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { type: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3️⃣ HARD DELETE TRANSACTION
    await prisma.$transaction(async (tx) => {
      // ───── Team leader protection ─────
      const leadsTeam = await tx.posterTeam.findFirst({
        where: { leaderId: userId },
      });

      if (leadsTeam) {
        throw new Error("USER_IS_TEAM_LEADER");
      }

      // ───────── SELLER CLEANUP ─────────
      if (user.type === "seller") {
        await tx.claim.deleteMany({ where: { sellerId: userId } });
        await tx.sellerQueue.deleteMany({ where: { sellerId: userId } });
        await tx.sellerLimit.deleteMany({ where: { sellerId: userId } });
        await tx.sellerRequestLog.deleteMany({ where: { sellerId: userId } });
      }

      // ───────── POSTER CLEANUP ─────────
      if (user.type === "poster") {
        // Delete post deletions linked to posts first
        await tx.postDeletion.deleteMany({
          where: {
            post: { posterId: userId },
          },
        });

        // Delete claims on poster posts
        await tx.claim.deleteMany({
          where: {
            post: { posterId: userId },
          },
        });

        // Delete posts
        await tx.post.deleteMany({
          where: { posterId: userId },
        });
      }

      // ───────── COMMON CLEANUP ─────────
      await tx.notification.deleteMany({ where: { userId } });
      await tx.postDeletion.deleteMany({ where: { sellerId: userId } });

      // ───────── FINALLY DELETE USER ─────────
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("HARD DELETE USER ERROR:", error);

    if (error.message === "USER_IS_TEAM_LEADER") {
      return NextResponse.json(
        { error: "User is a team leader. Reassign or delete team first." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to hard delete user" },
      { status: 500 },
    );
  }
}
