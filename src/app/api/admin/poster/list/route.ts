import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const posters = await prisma.user.findMany({
      where: {
        type: "poster",
        isActive: true,
        teamId: null, // poster has no team
      },
      select: {
        id: true,
        name: true,
        userName: true,
      },
    });

    return NextResponse.json(posters);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch poster list" },
      { status: 500 },
    );
  }
}
