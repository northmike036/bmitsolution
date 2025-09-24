import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, userName, password } = await req.json();

    if (!name || !userName || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { userName } });
    if (existing) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        name,
        userName,
        password: hashedPassword,
        type: "root",
      },
    });

    return NextResponse.json(
      { message: "Admin user created successfully", admin },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SETUP_ADMIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
