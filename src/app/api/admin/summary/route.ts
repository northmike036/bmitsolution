// /app/api/admin/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
} from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Post counts
    const [
      postsToday,
      postsYesterday,
      postsThisWeek,
      postsThisMonth,
      lastMonthPosts,
    ] = await Promise.all([
      prisma.post.count({
        where: { createdAt: { gte: startOfDay(now), lte: endOfDay(now) } },
      }),
      prisma.post.count({
        where: {
          createdAt: {
            gte: startOfDay(subDays(now, 1)),
            lte: endOfDay(subDays(now, 1)),
          },
        },
      }),
      prisma.post.count({
        where: { createdAt: { gte: startOfWeek(now), lte: endOfWeek(now) } },
      }),
      prisma.post.count({
        where: {
          createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
        },
      }),
      prisma.post.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
    ]);

    // Claim counts
    const [claimsToday, claimsYesterday, claimsThisWeek, claimsThisMonth] =
      await Promise.all([
        prisma.claim.count({
          where: { claimedAt: { gte: startOfDay(now), lte: endOfDay(now) } },
        }),
        prisma.claim.count({
          where: {
            claimedAt: {
              gte: startOfDay(subDays(now, 1)),
              lte: endOfDay(subDays(now, 1)),
            },
          },
        }),
        prisma.claim.count({
          where: {
            claimedAt: { gte: startOfWeek(now), lte: endOfWeek(now) },
          },
        }),
        prisma.claim.count({
          where: {
            claimedAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
          },
        }),
      ]);

    // General counts
    const [totalUsers, totalPosts, availableLeads, deletedLeads] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.post.count({ where: { claimed: false } }),
        prisma.post.count({ where: { deleted: true } }),
      ]);

    const [totalPosters, totalSellers] = await Promise.all([
      prisma.user.count({ where: { type: "poster" } }),
      prisma.user.count({ where: { type: "seller" } }),
    ]);

    const topPosters = await prisma.user.findMany({
      where: { type: "poster" },
      take: 5,
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        name: true,
        userName: true,
        createdAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    const totalRequests = await prisma.sellerQueue.count();

    return NextResponse.json({
      totalUsers,
      totalPosters,
      totalSellers,
      totalPosts,
      deletedLeads,
      availableLeads,
      totalRequests,
      topPosters,
      posts: {
        today: postsToday,
        yesterday: postsYesterday,
        thisWeek: postsThisWeek,
        thisMonth: postsThisMonth,
        lastMonth: lastMonthPosts,
      },
      claims: {
        today: claimsToday,
        yesterday: claimsYesterday,
        thisWeek: claimsThisWeek,
        thisMonth: claimsThisMonth,
      },
    });
  } catch (err) {
    console.error("[ADMIN_SUMMARY]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
