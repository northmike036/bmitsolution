import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RouteContext } from "../../../../../../types/RouteContext";

type PostRouteContext = RouteContext<{ id: string }>;

export async function POST(req: Request, context: PostRouteContext) {
  const { id } = await context.params;

  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
