import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "../../../../../generated/prisma";
import { differenceInSeconds, startOfDay } from "date-fns";

export async function POST() {
  const session = await getServerSession(authOptions);
  const sellerId = session?.user?.id;

  if (!sellerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: sellerId,
    },
  });

  if (!user?.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limit = await prisma.sellerLimit.findUnique({
    where: { sellerId },
  });

  if (!limit) {
    return NextResponse.json(
      { error: "No limit profile set for seller" },
      { status: 400 },
    );
  }

  const now = new Date();

  // Check cooldown
  if (limit.lastRequestAt) {
    const secondsSinceLast = differenceInSeconds(now, limit.lastRequestAt);
    if (secondsSinceLast < limit.cooldownSecs) {
      await prisma.sellerRequestLog.create({
        data: {
          sellerId,
          outcome: RequestStatus.rejected_cooldown,
        },
      });

      return NextResponse.json({
        status: "cooldown",
        remaining: limit.cooldownSecs - secondsSinceLast,
      });
    }
  }

  // Check daily usage
  const dailyCount = await prisma.sellerRequestLog.count({
    where: {
      sellerId,
      createdAt: { gte: startOfDay(now) },
      outcome: RequestStatus.success,
    },
  });

  if (dailyCount >= limit.dailyLimit) {
    await prisma.sellerRequestLog.create({
      data: {
        sellerId,
        outcome: RequestStatus.rejected_limit,
      },
    });

    return NextResponse.json({ status: "limit_reached" }, { status: 429 });
  }

  // Find an unclaimed post
  const post = await prisma.post.findFirst({
    where: { claimed: false },
    orderBy: { createdAt: "asc" },
  });

  if (!post) {
    return NextResponse.json({ status: "No Leads Available" });
  }

  // Assign the post (mark as claimed, create claim, update usage)
  const [claim] = await prisma.$transaction([
    prisma.claim.create({
      data: {
        sellerId,
        postId: post.id,
      },
    }),
    prisma.post.update({
      where: { id: post.id },
      data: { claimed: true },
    }),
    prisma.sellerRequestLog.create({
      data: {
        sellerId,
        outcome: RequestStatus.success,
      },
    }),
    prisma.sellerQueue.upsert({
      where: { sellerId },
      update: { createdAt: now },
      create: {
        sellerId,
        createdAt: now,
      },
    }),
    prisma.sellerLimit.update({
      where: { sellerId },
      data: { lastRequestAt: now },
    }),
  ]);

  return NextResponse.json({ status: "success", post });
}
