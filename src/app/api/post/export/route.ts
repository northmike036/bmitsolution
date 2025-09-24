import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  try {
    // 1. Fetch posts from DB pg
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        phone: true,
        message: true,
        createdAt: true,
        claimed: true,
        poster: {
          select: {
            userName: true,
          },
        },
      },
    });

    // 2. Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Posts");

    // 3. Add headers
    worksheet.columns = [
      { header: "ID", key: "id", width: 32 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Message", key: "message", width: 40 },
      { header: "Created At", key: "createdAt", width: 24 },
      { header: "Claimed", key: "claimed", width: 10 },
      { header: "Poster Username", key: "poster", width: 20 },
    ];

    // 4. Add rows
    posts.forEach((post) => {
      worksheet.addRow({
        id: post.id,
        phone: post.phone,
        message: post.message,
        createdAt: post.createdAt.toISOString(),
        claimed: post.claimed ? "Yes" : "No",
        poster: post.poster?.userName || "N/A",
      });
    });

    // 5. Convert to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 6. Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="posts_export.xlsx"`,
      },
    });
  } catch (error) {
    console.error("[EXPORT_POSTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to export posts" },
      { status: 500 }
    );
  }
}
