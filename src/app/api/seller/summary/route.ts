// /app/api/seller/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.type !== "seller") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellerId = session.user.id;

  const todayStart = startOfDay(new Date());
  const yesterdayStart = startOfDay(subDays(new Date(), 1));
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisMonthStart = startOfMonth(new Date());
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

  try {
    const [counts] = await prisma.$queryRawUnsafe<
      {
        totalRequests: bigint;
        requestsToday: bigint;
        requestsYesterday: bigint;
        requestsThisWeek: bigint;
        requestsThisMonth: bigint;
        requestsLastMonth: bigint;
      }[]
    >(
      `
      SELECT
        (SELECT COUNT(*) FROM "SellerRequestLog" WHERE "sellerId" = $1) AS "totalRequests",
        (SELECT COUNT(*) FROM "SellerRequestLog" WHERE "sellerId" = $1 AND "createdAt" >= $2) AS "requestsToday",
        (SELECT COUNT(*) FROM "SellerRequestLog" WHERE "sellerId" = $1 AND "createdAt" >= $3 AND "createdAt" < $2) AS "requestsYesterday",
        (SELECT COUNT(*) FROM "SellerRequestLog" WHERE "sellerId" = $1 AND "createdAt" >= $4) AS "requestsThisWeek",
        (SELECT COUNT(*) FROM "SellerRequestLog" WHERE "sellerId" = $1 AND "createdAt" >= $5) AS "requestsThisMonth",
        (SELECT COUNT(*) FROM "SellerRequestLog" WHERE "sellerId" = $1 AND "createdAt" >= $6 AND "createdAt" < $5) AS "requestsLastMonth"
      `,
      sellerId,
      todayStart,
      yesterdayStart,
      thisWeekStart,
      thisMonthStart,
      lastMonthStart,
    );

    // Convert BigInt → Number
    const countsFixed = {
      totalRequests: Number(counts.totalRequests),
      requestsToday: Number(counts.requestsToday),
      requestsYesterday: Number(counts.requestsYesterday),
      requestsThisWeek: Number(counts.requestsThisWeek),
      requestsThisMonth: Number(counts.requestsThisMonth),
      requestsLastMonth: Number(counts.requestsLastMonth),
    };

    // Separate query for limit profile
    const limitProfile = await prisma.sellerLimit.findUnique({
      where: { sellerId },
      select: { dailyLimit: true, usageCount: true },
    });

    const remainingQuota = limitProfile
      ? limitProfile.dailyLimit - (limitProfile.usageCount || 0)
      : null;

    return NextResponse.json({
      ...countsFixed,
      remainingQuota,
    });
  } catch (err) {
    console.error("[SELLER_SUMMARY]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
