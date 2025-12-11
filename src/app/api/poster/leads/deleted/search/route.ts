// src/app/api/admin/posts/deleted/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone || phone.trim() === "") {
      return NextResponse.json([], { status: 200 });
    }

    const posts = await prisma.postDeletion.findMany({
      where: {
        post: {
          phone: {
            contains: phone,
            mode: "insensitive", // case insensitive search
          },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            phone: true,
            clientName: true,
            agentName: true,
            message: true,
            location: true,
            screenshot: true,
            postType: true,
            rent: true,
            poster: {
              select: {
                id: true,
                name: true,
                userName: true,
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            userName: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching deleted posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch deleted posts" },
      { status: 500 },
    );
  }
}
