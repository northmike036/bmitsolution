// app/api/admin/toggle-sellers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { activate, userType } = body;

    if (typeof activate !== "boolean") {
      return NextResponse.json(
        { success: false, error: "`activate` must be a boolean (true/false)." },
        { status: 400 }
      );
    }

    const result = await prisma.user.updateMany({
      where: {
        type: userType,
        isActive: !activate, // only update those that need change
      },
      data: {
        isActive: activate,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${activate ? "Activated" : "Deactivated"} ${
        result.count
      } ${userType}(s).`,
    });
  } catch (error) {
    console.error("Toggle sellers failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
