import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// handle read new lead
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        new: false,
      },
    });
    return NextResponse.json({
      success: true,
      message: "leads updated",
    });
  } catch (error) {
    console.error("failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
