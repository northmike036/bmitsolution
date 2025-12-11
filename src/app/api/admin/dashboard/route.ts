import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // --- USER COUNTS ---
    const totalUsers = await prisma.user.count();
    const totalPosters = await prisma.user.count({ where: { type: "poster" } });
    const totalSellers = await prisma.user.count({ where: { type: "seller" } });

    // --- LEADS (POSTS) ---
    const totalLeads = await prisma.post.count({ where: { deleted: false } });
    const fbLeads = await prisma.post.count({
      where: { postType: "fb", deleted: false },
    });
    const clLeads = await prisma.post.count({
      where: { postType: "cl", deleted: false },
    });
    const deletedLeads = await prisma.post.count({ where: { deleted: true } });
    const availableLeads = await prisma.post.count({
      where: { deleted: false, claimed: false },
    });

    return NextResponse.json({
      success: true,
      users: {
        totalUsers,
        totalPosters,
        totalSellers,
      },
      leads: {
        totalLeads,
        fbLeads,
        clLeads,
        deletedLeads,
        availableLeads,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load stats." },
      { status: 500 },
    );
  }
}
