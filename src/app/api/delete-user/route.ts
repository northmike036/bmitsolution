// app/api/admin/delete-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust if your prisma client is elsewhere

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Delete related claims===>
    await prisma.claim.deleteMany({
      where: {
        sellerId: userId,
      },
    });

    // Delete posts created by the user (if they are a poster)
    await prisma.post.deleteMany({
      where: {
        posterId: userId,
      },
    });

    // Delete seller queues
    await prisma.sellerQueue.deleteMany({
      where: {
        sellerId: userId,
      },
    });

    // Delete seller limit profile
    await prisma.sellerLimit.deleteMany({
      where: {
        sellerId: userId,
      },
    });

    // Delete seller request logs
    await prisma.sellerRequestLog.deleteMany({
      where: {
        sellerId: userId,
      },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User deletion failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
