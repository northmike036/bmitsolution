import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const session = await getServerSession(authOptions);

  if (!session || session.user.type !== "poster") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    todayCount,
    postsYesterday,
    weeklyCount,
    postsThisMonth,
    lastMonthPosts,
    totalCount,
    deletedLeads,
    fbLeads,
    clLeads,
  ] = await Promise.all([
    prisma.post.count({
      where: {
        posterId: userId,
        deleted: false,
        createdAt: {
          gte: startOfDay(new Date()),
        },
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
        deleted: false,
        createdAt: {
          gte: startOfDay(subDays(now, 1)),
          lte: endOfDay(subDays(now, 1)),
        },
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
        deleted: false,
        createdAt: {
          gte: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
        },
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
        deleted: false,
        createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
        deleted: false,
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
        deleted: true,
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
        postType: "fb",
        deleted: false,
      },
    }),
    prisma.post.count({
      where: {
        posterId: userId,
        postType: "cl",
        deleted: false,
      },
    }),
  ]);

  return NextResponse.json({
    today: todayCount,
    yesterday: postsYesterday,
    weekly: weeklyCount,
    monthly: postsThisMonth,
    lastMonth: lastMonthPosts,
    total: totalCount,
    deletedLeads,
    fbLeads,
    clLeads,
  });
}
