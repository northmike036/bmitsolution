// /api/seller/limits/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.type !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limit = await prisma.sellerLimit.findUnique({
      where: { sellerId: session.user.id },
      select: {
        dailyLimit: true,
        cooldownSecs: true,
        usageCount: true,
        lastRequestAt: true,
      },
    });

    if (!limit) {
      return NextResponse.json(
        { error: "Limit profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(limit);
  } catch (err) {
    console.error("[SELLER_LIMIT]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
