// /app/api/admin/teams/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateTeamBody = {
  name: string;
  leaderId: string;
};

export async function GET() {
  try {
    const teams = await prisma.posterTeam.findMany({
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            userName: true,
          },
        },
        // Count total posters inside this team
        _count: {
          select: {
            members: true, // does NOT work because you don't use join table
          },
        },
      },
    });

    // Fix: _count.members doesn't work with direct teamId
    // Need manual count
    const result = await Promise.all(
      teams.map(async (team) => {
        const memberCount = await prisma.user.count({
          where: { teamId: team.id, type: "poster" },
        });

        return {
          ...team,
          memberCount,
        };
      }),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load teams" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.type !== "root") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateTeamBody;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, leaderId } = body;
  if (!name || !leaderId) {
    return NextResponse.json(
      { error: "name and leaderId are required" },
      { status: 400 },
    );
  }

  // Verify leader exists and is a poster
  const leader = await prisma.user.findUnique({ where: { id: leaderId } });
  if (!leader) {
    return NextResponse.json(
      { error: "Leader user not found" },
      { status: 404 },
    );
  }
  if (leader.type !== "poster") {
    return NextResponse.json(
      { error: "Leader must be of type poster" },
      { status: 400 },
    );
  }

  // Ensure leader is not already leading another team (leaderId is unique in PosterTeam)
  const existingLead = await prisma.posterTeam.findUnique({
    where: { leaderId },
  });
  if (existingLead) {
    return NextResponse.json(
      { error: "This user is already a leader of a team" },
      { status: 400 },
    );
  }

  // Create the team and set leader.teamId to the same team (so leader is part of the team members)
  const created = await prisma.$transaction(async (tx) => {
    const team = await tx.posterTeam.create({
      data: {
        name,
        leaderId,
      },
    });

    // set leader.teamId to new team.id
    await tx.user.update({
      where: { id: leaderId },
      data: { teamId: team.id },
    });

    return team;
  });

  return NextResponse.json(created, { status: 201 });
}
