import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today);
    monthStart.setDate(1); // first day of the current month ==>

    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    const posters = await prisma.user.findMany({
      where: { type: "poster" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        userName: true,
        createdAt: true,
        _count: {
          select: { posts: true },
        },
        posts: {
          select: { createdAt: true },
        },
      },
    });

    const enrichedPosters = posters.map((poster) => {
      const dailyPosts = poster.posts.filter(
        (p) => p.createdAt >= today,
      ).length;

      const yesterdayPosts = poster.posts.filter(
        (p) => p.createdAt >= yesterdayStart && p.createdAt < today,
      ).length;

      const weeklyPosts = poster.posts.filter(
        (p) => p.createdAt >= weekStart,
      ).length;

      const monthlyPosts = poster.posts.filter(
        (p) => p.createdAt >= monthStart,
      ).length;

      const lastMonthPosts = poster.posts.filter(
        (p) => p.createdAt >= lastMonthStart && p.createdAt < lastMonthEnd,
      ).length;

      return {
        id: poster.id,
        name: poster.name,
        userName: poster.userName,
        createdAt: poster.createdAt,
        dailyPosts,
        yesterdayPosts,
        weeklyPosts,
        monthlyPosts,
        lastMonthPosts,
        _count: {
          posts: poster._count.posts,
        },
      };
    });
    return NextResponse.json(enrichedPosters);
  } catch (error) {
    console.error("[ADMIN_POSTERS]", error);
    return NextResponse.json(
      { error: "Failed to fetch posters" },
      { status: 500 },
    );
  }
}
