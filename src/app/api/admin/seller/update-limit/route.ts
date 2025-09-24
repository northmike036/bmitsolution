// /app/api/admin/sellers/update-limit/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { dailyLimit, cooldownSecs } = await req.json();

    if (typeof dailyLimit !== "number" || typeof cooldownSecs !== "number") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Update all SellerLimit records
    const updated = await prisma.sellerLimit.updateMany({
      data: {
        dailyLimit,
        cooldownSecs,
      },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    console.error("[UPDATE_SELLER_LIMITS]", error);
    return NextResponse.json(
      { error: "Failed to update seller limits" },
      { status: 500 }
    );
  }
}
