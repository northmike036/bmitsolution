import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const updated = await prisma.notification.updateMany({
      where: {
        OR: [
          { userId },
          { userId: null }, // global announcements also marked as read
        ],
      },
      data: { read: true },
    });

    return NextResponse.json({ count: updated.count });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
