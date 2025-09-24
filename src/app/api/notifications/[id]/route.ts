import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RouteContext } from "../../../../../types/RouteContext";

// retrive notification by id

type PostRouteContext = RouteContext<{ id: string }>;

export async function GET(req: Request, context: PostRouteContext) {
  const { id } = await context.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    return NextResponse.json(notification);
  } catch (err) {
    console.error("Error finding notification", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
