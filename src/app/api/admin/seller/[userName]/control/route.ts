import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, startOfWeek } from "date-fns";

type tParams = Promise<{ userName: string }>;

export async function GET(_: NextRequest, { params }: { params: tParams }) {
  const { userName } = await params;
  try {
    if (!userName) {
      return NextResponse.json(
        { error: "UserName not found" },
        { status: 404 }
      );
    }
    const seller = await prisma.user.findUnique({
      where: { userName: userName, type: "seller" },
      include: {
        limitProfile: true,
        requestLogs: {
          where: {
            createdAt: {
              gte: startOfWeek(new Date()),
            },
          },
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const today = startOfDay(new Date());
    const dailyCount = seller.requestLogs.filter(
      (log) => log.createdAt >= today
    ).length;
    const weeklyCount = seller.requestLogs.length;

    return NextResponse.json({
      seller: {
        id: seller.id,
        userName: seller.userName,
        name: seller.name,
        isActive: seller.isActive,
        limitProfile: seller.limitProfile,
        dailyCount,
        weeklyCount,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: tParams }) {
  const { userName } = await params;
  const { dailyLimit, cooldownSecs } = await req.json();

  try {
    const seller = await prisma.user.findUnique({
      where: { userName: userName },
    });
    if (!seller)
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    const updated = await prisma.sellerLimit.upsert({
      where: { sellerId: seller.id },
      update: { dailyLimit, cooldownSecs },
      create: {
        sellerId: seller.id,
        dailyLimit,
        cooldownSecs,
      },
    });

    return NextResponse.json({ updated });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
