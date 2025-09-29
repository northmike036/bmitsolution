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

    if (!user || user.type !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    // Query with pagination
    const claims = await prisma.claim.findMany({
      where: { sellerId: user.id },
      orderBy: { claimedAt: "desc" },
      skip,
      take: limit,
      select: {
        claimedAt: true,
        post: {
          select: {
            id: true,
            phone: true,
            message: true,
            clientName: true,
            agentName: true,
            location: true,
            rent: true,
            screenshot: true,
            createdAt: true,
            new: true,
            poster: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const totalClaims = await prisma.claim.count({
      where: { sellerId: user.id },
    });

    const formatted = claims.map((claim) => ({
      id: claim.post.id,
      phone: claim.post.phone,
      message: claim.post.message,
      createdAt: claim.post.createdAt,
      poster: claim.post.poster.name,
      clientName: claim.post.clientName,
      agentName: claim.post.agentName,
      location: claim.post.location,
      rent: claim.post.rent,
      screenshot: claim.post.screenshot,
      claimedAt: claim.claimedAt,
      new: claim.post.new,
    }));

    return NextResponse.json(
      safeJson({
        claims: formatted,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalClaims / limit),
          totalClaims,
        },
      }),
    );
  } catch (err) {
    console.error("[SELLER_CLAIMS]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
