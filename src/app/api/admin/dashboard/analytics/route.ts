import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range");
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  let start: Date;
  let end: Date;

  const now = new Date();

  if (fromParam) {
    start = new Date(fromParam);
    end = toParam ? new Date(toParam) : new Date(fromParam);
    // Force full day boundaries
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    switch (range) {
      case "daily":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);

        end = new Date(now);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "weekly":
        const day = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
    }
  }

  try {
    // Single query optimization using Prisma aggregate
    const [
      totalPosts,
      deletedPosts,
      availablePosts,
      dailyClaims,
      fbLeads,
      clLeads,
    ] = await Promise.all([
      prisma.post.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.post.count({
        where: { deleted: true, createdAt: { gte: start, lte: end } },
      }),
      prisma.post.count({
        where: {
          deleted: false,
          claimed: false,
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.claim.count({ where: { claimedAt: { gte: start, lte: end } } }),
      prisma.post.count({
        where: { postType: "fb", createdAt: { gte: start, lte: end } },
      }),
      prisma.post.count({
        where: { postType: "cl", createdAt: { gte: start, lte: end } },
      }),
    ]);

    return NextResponse.json({
      totalPosts,
      deletedPosts,
      availablePosts,
      dailyClaims,
      fbLeads,
      clLeads,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
