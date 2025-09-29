import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

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

    const leads = await prisma.post.findMany({
      where: {
        posterId: user.id,
        phone: {
          contains: phone,
          mode: "insensitive", // case-insensitive search
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10, // limit results
      select: {
        id: true,
        phone: true,
        message: true,
        agentName: true,
        location: true,
        rent: true,
        screenshot: true,
        clientName: true,
        createdAt: true,
      },
    });

    const formatted = leads.map((lead) => ({
      id: lead.id,
      phone: lead.phone,
      message: lead.message,
      createdAt: lead.createdAt,
      clientName: lead.clientName,
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
