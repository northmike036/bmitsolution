// /app/api/admin/announcements/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher"; // assume you have this

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Create notification with userId = null (global)
    const notification = await prisma.notification.create({
      data: {
        type: "ADMIN_ANNOUNCEMENT",
        message,
        userId: null,
      },
    });

    // Push via Pusher (global channel)
    await pusherServer.trigger(
      "global-announcements",
      "notification",
      notification
    );

    return NextResponse.json({ success: true, notification });
  } catch (err) {
    console.error("[ADMIN_ANNOUNCEMENT]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
