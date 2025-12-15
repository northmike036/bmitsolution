// /app/api/admin/teams/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.type !== "root") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const team = await prisma.posterTeam.findUnique({
    where: { id },
    include: {
      leader: true,
      members: true,
    },
  });

  if (!team)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  return NextResponse.json(team);
}

export async function DELETE(req: Request, { params }: { params: tParams }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.type !== "root") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const team = await prisma.posterTeam.findUnique({ where: { id } });
  if (!team)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Delete team and remove teamId from members and leader in a transaction
  await prisma.$transaction(async (tx) => {
    // set all members teamId to null
    await tx.user.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    });

    // delete the team
    await tx.posterTeam.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
