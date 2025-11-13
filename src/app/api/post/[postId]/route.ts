import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      message,
      clientName,
      agentName,
      location,
      rent,
      screenshot,
      postId,
    } = body;

    const founded = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        phone: true,
        message: true,
        clientName: true,
        createdAt: true,
        agentName: true,
        location: true,
        rent: true,
        screenshot: true,
        new: true,
        deleted: true,
        deletions: true,
        claim: true,
      },
    });

    if (founded?.claim && founded?.deleted) {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          ...(phone !== undefined && { phone }),
          ...(message !== undefined && { message }),
          ...(clientName !== undefined && { clientName }),
          ...(agentName !== undefined && { agentName }),
          ...(location !== undefined && { location }),
          ...(rent !== undefined && { rent }),
          ...(screenshot !== undefined && { screenshot }),
          deleted: false,
        },
      });
      const notification = await prisma.notification.create({
        data: {
          userId: updatedPost.posterId,
          type: "POST_DELETION",
          message: "A Post Is Updated You Deleted",
          metadata: { postId, phone: updatedPost.phone },
        },
      });
      await pusher.trigger(
        `user-${founded.claim.sellerId}`,
        "notification",
        notification,
      );
      return NextResponse.json(updatedPost);
    } else {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          ...(phone !== undefined && { phone }),
          ...(message !== undefined && { message }),
          ...(clientName !== undefined && { clientName }),
          ...(agentName !== undefined && { agentName }),
          ...(location !== undefined && { location }),
          ...(rent !== undefined && { rent }),
          ...(screenshot !== undefined && { screenshot }),
        },
      });

      return NextResponse.json(updatedPost);
    }
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}
