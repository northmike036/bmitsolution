// /app/api/admin/teams/[id]/assign/route.ts
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
  console.log({ posterId, teamId });
  if (!posterId)
    return NextResponse.json({ error: "posterId required" }, { status: 400 });

  // Validate poster exists and is poster type
  const poster = await prisma.user.findUnique({ where: { id: posterId } });
  if (!poster)
    return NextResponse.json({ error: "Poster not found" }, { status: 404 });
  if (poster.type !== "poster")
    return NextResponse.json(
      { error: "User must be a poster" },
      { status: 400 },
    );
  if (poster.teamId)
    return NextResponse.json(
      { error: "Poster already belongs to a team" },
      { status: 400 },
    );

  // validate team exists
  const team = await prisma.posterTeam.findUnique({ where: { id: teamId } });
  if (!team)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // update poster.teamId
  const updated = await prisma.user.update({
    where: { id: posterId },
    data: { teamId },
  });

  return NextResponse.json(updated);
}
