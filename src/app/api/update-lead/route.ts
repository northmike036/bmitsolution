import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await prisma.post.updateMany({
      where: { claimed: true },
      data: { new: false },
    });

    // claimed = false → new = true
    await prisma.post.updateMany({
      where: { claimed: false },
      data: { new: true },
    });

    console.log("✅ Backfill complete");

    return NextResponse.json({
      success: true,
      message: "leads updated",
    });
  } catch (error) {
    console.error("Toggle sellers failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
