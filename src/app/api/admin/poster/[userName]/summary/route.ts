// /app/api/admin/poster/[userName]/summary/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, startOfWeek } from "date-fns";

type tParams = Promise<{ userName: string }>;

export async function GET(request: Request, { params }: { params: tParams }) {
  const { userName } = await params;

  const user = await prisma.user.findUnique({
    where: { userName },
    select: {
      id: true,
      name: true,
      userName: true,
      isActive: true,
      createdAt: true,
      type: true,
    },
  });

  if (!user || user.type !== "poster") {
    return NextResponse.json({ error: "Poster not found" }, { status: 404 });
  }

  const [totalPosts, postsToday, postsThisWeek] = await Promise.all([
    prisma.post.count({ where: { posterId: user.id } }),
    prisma.post.count({
      where: {
        posterId: user.id,
        createdAt: { gte: startOfDay(new Date()) },
      },
    }),
    prisma.post.count({
      where: {
        posterId: user.id,
        createdAt: { gte: startOfWeek(new Date()) },
      },
    }),
  ]);
  // return result

  return NextResponse.json({
    user,
    totalPosts,
    postsToday,
    postsThisWeek,
  });
}
