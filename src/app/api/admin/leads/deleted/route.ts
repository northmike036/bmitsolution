// src/app/api/admin/posts/deleted/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper to safely convert BigInts
function safeJson(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.type !== "root") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    const total = await prisma.postDeletion.count();

    const posts = await prisma.postDeletion.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            phone: true,
            message: true,
            clientName: true,
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

    return NextResponse.json(
      safeJson({
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching deleted posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch deleted posts" },
      { status: 500 }
    );
  }
}
