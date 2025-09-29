import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    await prisma.post.updateMany({
      data: {
        agentName: "Not available",
        location: "Not available",
        rent: "Not available",
        screenshot: "Not available",
      },
    });

    return NextResponse.json({ msg: "success" });
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}
