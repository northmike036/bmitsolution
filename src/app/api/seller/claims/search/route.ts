import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.type !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone || phone.trim() === "") {
      return NextResponse.json([], { status: 200 });
    }

    const claims = await prisma.claim.findMany({
      where: {
        sellerId: user.id,
        post: {
          phone: {
            contains: phone,
            mode: "insensitive", // case-insensitive search
          },
        },
      },
      orderBy: { claimedAt: "desc" },
      take: 10, // limit results
      include: {
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
            poster: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const formatted = claims.map((claim) => ({
      id: claim.post.id,
      phone: claim.post.phone,
      message: claim.post.message,
      createdAt: claim.post.createdAt,
      clientName: claim.post.clientName,
      agentName: claim.post.agentName,
      location: claim.post.location,
      rent: claim.post.rent,
      screenshot: claim.post.screenshot,
      claimedAt: claim.claimedAt,
      poster: claim.post.poster.name,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("[SELLER_CLAIMS_SEARCH]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
