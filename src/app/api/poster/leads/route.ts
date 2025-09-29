// /app/api/seller/claims/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Helper to safely convert BigInts
function safeJson(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? Number(value) : value,
    ),
  );
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.type !== "poster") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    // Query with pagination
    const posts = await prisma.post.findMany({
      where: { posterId: user.id, deleted: false },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        phone: true,
        message: true,
        clientName: true,
        createdAt: true,
        agentName: true,
        location: true,
        rent: true,
        screenshot: true,
        new: true,
      },
    });

    const totalPosts = await prisma.post.count({
      where: { posterId: user.id },
    });

    return NextResponse.json(
      safeJson({
        claims: posts,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalPosts / limit),
        },
      }),
    );
  } catch (err) {
    console.error("[Poster_Leads]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
