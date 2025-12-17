import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PurgeBody = {
  from: string; // accepts YYYY-MM-DD, MM-DD-YYYY or MM-DD-YY
  to: string; // inclusive; end of day
};

function parseFlexibleDate(input: string): Date | null {
  if (!input || typeof input !== "string") return null;
  const parts = input.split("-");
  if (parts.length !== 3) return null;

  let year: number;
  let month: number;
  let day: number;

  // YYYY-MM-DD
  if (parts[0].length === 4) {
    year = Number(parts[0]);
    month = Number(parts[1]);
    day = Number(parts[2]);
  } else {
    // MM-DD-YYYY or MM-DD-YY (assume 2000+YY)
    month = Number(parts[0]);
    day = Number(parts[1]);
    const yy = parts[2];
    if (yy.length === 2) {
      year = 2000 + Number(yy);
    } else if (yy.length === 4) {
      year = Number(yy);
    } else {
      return null;
    }
  }

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user || user.type !== "root") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as PurgeBody;
    const fromStr = body?.from;
    const toStr = body?.to;

    const startDate = parseFlexibleDate(fromStr);
    const endDateBase = parseFlexibleDate(toStr);

    if (!startDate || !endDateBase) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD or MM-DD-YYYY/YY." },
        { status: 400 },
      );
    }

    const endDate = endOfDay(endDateBase);
    if (startDate.getTime() > endDate.getTime()) {
      return NextResponse.json(
        { error: '"from" must be on or before "to"' },
        { status: 400 },
      );
    }

    // Pull target post ids first (ids only to reduce payload)
    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { id: true },
    });

    if (!posts.length) {
      return NextResponse.json({
        deletedPosts: 0,
        deletedClaims: 0,
        deletedDeletionLogs: 0,
      });
    }

    const ids = posts.map((p) => p.id);

    const chunkSize = 1000;
    let totalDeletedPosts = 0;
    let totalDeletedClaims = 0;
    let totalDeletedDeletions = 0;

    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);

      const [delDeletions, delClaims, delPosts] = await prisma.$transaction([
        prisma.postDeletion.deleteMany({ where: { postId: { in: chunk } } }),
        prisma.claim.deleteMany({ where: { postId: { in: chunk } } }),
        prisma.post.deleteMany({ where: { id: { in: chunk } } }),
      ]);

      totalDeletedDeletions += delDeletions.count;
      totalDeletedClaims += delClaims.count;
      totalDeletedPosts += delPosts.count;
    }

    return NextResponse.json({
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      deletedPosts: totalDeletedPosts,
      deletedClaims: totalDeletedClaims,
      deletedDeletionLogs: totalDeletedDeletions,
    });
  } catch (err) {
    console.error("[ADMIN_PURGE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
