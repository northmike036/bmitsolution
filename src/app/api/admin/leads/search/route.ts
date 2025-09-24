import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.type !== "root") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone || phone.trim() === "") {
      return NextResponse.json([], { status: 200 });
    }

    const posts = await prisma.post.findMany({
      where: {
        phone: {
          contains: phone,
          mode: "insensitive", // case insensitive search
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10, // limit results for performance
      include: {
        poster: {
          select: { id: true, name: true, userName: true },
        },
        claim: {
          select: {
            id: true,
            claimedAt: true,
            seller: { select: { id: true, name: true, userName: true } },
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error("[ADMIN_POSTS_SEARCH]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
