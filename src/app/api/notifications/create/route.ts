// src/app/api/notifications/create/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, message, metadata } = body;

    const notification = await prisma.notification.create({
      data: { userId, type, message, metadata },
    });

    // Trigger Pusher here
    await pusher.trigger("notifications", "new-notification", notification);

    return NextResponse.json(notification);
  } catch (err) {
    console.error("[CREATE_NOTIFICATION]", err);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
