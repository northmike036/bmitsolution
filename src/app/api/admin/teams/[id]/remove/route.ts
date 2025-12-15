// /app/api/admin/teams/[id]/remove/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Body = { posterId: string };
type tParams = Promise<{ id: string }>;

export async function POST(req: Request, { params }: { params: tParams }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.type !== "root") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: teamId } = await params;
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { posterId } = body;
  if (!posterId)
    return NextResponse.json({ error: "posterId required" }, { status: 400 });

  // ensure poster belongs to this team
  const poster = await prisma.user.findUnique({ where: { id: posterId } });
  if (!poster)
    return NextResponse.json({ error: "Poster not found" }, { status: 404 });
  if (poster.teamId !== teamId)
    return NextResponse.json(
      { error: "Poster does not belong to this team" },
      { status: 400 },
    );

  // if poster is leader, disallow removal via this endpoint (you must change leader first)
  const team = await prisma.posterTeam.findUnique({ where: { id: teamId } });
  if (!team)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (team.leaderId === posterId) {
    return NextResponse.json(
      { error: "Cannot remove the leader. Reassign leader first." },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: posterId },
    data: { teamId: null },
  });

  return NextResponse.json(updated);
}
