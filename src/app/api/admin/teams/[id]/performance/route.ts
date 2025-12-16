// /app/api/admin/teams/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type tParams = Promise<{ id: string }>;

export async function GET(_: Request, { params }: { params: tParams }) {
  try {
    const session = await getServerSession(authOptions);
    let isAdmin = false;
    let isLeader = false;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session?.user.type === "root") {
      isAdmin = true;
    }
    if (session?.user.type === "poster") {
      const leader = await prisma.posterTeam.findFirst({
        where: { leaderId: session?.user.id },
        select: {
          id: true,
          name: true,
        },
      });
      if (leader) {
        isLeader = true;
      }
    }
    if (!isAdmin && !isLeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    // --- DATE RANGES ---
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday-based week

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // --- TEAM MEMBERS ---
    const teamMembers = await prisma.user.findMany({
      where: { teamId },
      select: { id: true, name: true, userName: true },
    });

    const memberIds = teamMembers.map((m) => m.id);

    // --- TEAM POST COUNTS ---
    const [dailyPosts, weeklyPosts, monthlyPosts, lastMonthPosts] =
      await Promise.all([
        prisma.post.count({
          where: {
            posterId: { in: memberIds },
            createdAt: { gte: startOfToday },
          },
        }),

        prisma.post.count({
          where: {
            posterId: { in: memberIds },
            createdAt: { gte: startOfWeek },
          },
        }),

        prisma.post.count({
          where: {
            posterId: { in: memberIds },
            createdAt: { gte: startOfMonth },
          },
        }),

        prisma.post.count({
          where: {
            posterId: { in: memberIds },
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
      ]);

    // --- INDIVIDUAL MEMBER PERFORMANCE ---
    const memberBreakdown = await Promise.all(
      teamMembers.map(async (member) => {
        const [today, week, month, total] = await Promise.all([
          prisma.post.count({
            where: { posterId: member.id, createdAt: { gte: startOfToday } },
          }),
          prisma.post.count({
            where: { posterId: member.id, createdAt: { gte: startOfWeek } },
          }),
          prisma.post.count({
            where: { posterId: member.id, createdAt: { gte: startOfMonth } },
          }),
          prisma.post.count({
            where: { posterId: member.id },
          }),
        ]);

        return {
          id: member.id,
          name: member.name,
          userName: member.userName,
          daily: today,
          weekly: week,
          monthly: month,
          total,
        };
      }),
    );

    // --- TOP POSTERS (SORT BY TOTAL POSTS) ---
    const topPosters = [...memberBreakdown].sort((a, b) => b.total - a.total);

    return NextResponse.json({
      teamId,
      summary: {
        dailyPosts,
        weeklyPosts,
        monthlyPosts,
        lastMonthPosts,
      },
      memberBreakdown,
      topPosters,
    });
  } catch (err) {
    console.error("Team Performance Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch team performance" },
      { status: 500 },
    );
  }
}
