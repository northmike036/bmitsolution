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

    // Fetch posts with pagination info
    const [posts, total] = await Promise.all([
      prisma.postDeletion.findMany({
        where: {
          post: {
            posterId: user.id,
          },
        },
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
              agentName: true,
              location: true,
              rent: true,
              screenshot: true,
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
      }),
      prisma.post.count({
        where: {
          deleted: false, // ✅ match count with query
        },
      }),
    ]);

    return NextResponse.json(
      safeJson({
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }),
    );
  } catch (err) {
    console.error("[ADMIN_POSTS]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
