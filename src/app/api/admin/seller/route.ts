import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today);
    monthStart.setDate(1); // first day of this month

    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1); // first day of last month

    const sellers = await prisma.user.findMany({
      where: { type: "seller" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        userName: true,
        createdAt: true,
        _count: {
          select: {
            claims: true,
            requestLogs: true,
          },
        },
        claims: {
          select: { claimedAt: true },
        },
      },
    });

    const enrichedSellers = sellers.map((seller) => {
      const dailyClaims = seller.claims.filter(
        (c) => c.claimedAt >= today
      ).length;

      const yesterdayClaims = seller.claims.filter(
        (c) => c.claimedAt >= yesterdayStart && c.claimedAt < today
      ).length;

      const weeklyClaims = seller.claims.filter(
        (c) => c.claimedAt >= weekStart
      ).length;

      const monthlyClaims = seller.claims.filter(
        (c) => c.claimedAt >= monthStart
      ).length;

      const lastMonthClaims = seller.claims.filter(
        (c) => c.claimedAt >= lastMonthStart && c.claimedAt < monthStart
      ).length;

      return {
        id: seller.id,
        name: seller.name,
        userName: seller.userName,
        createdAt: seller.createdAt,
        dailyClaims,
        yesterdayClaims,
        weeklyClaims,
        monthlyClaims,
        lastMonthClaims,
        _count: {
          claims: seller._count.claims,
          requestLogs: seller._count.requestLogs,
        },
      };
    });

    return NextResponse.json(enrichedSellers);
  } catch (error) {
    console.error("[ADMIN_SELLERS]", error);
    return NextResponse.json(
      { error: "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}
