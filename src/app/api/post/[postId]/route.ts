import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, clientName, postId } = body;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(phone !== undefined && { phone }),
        ...(message !== undefined && { message }),
        ...(clientName !== undefined && { clientName }),
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
