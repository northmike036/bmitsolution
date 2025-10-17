import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Only authenticated root user can create accounts
  if (!session || session.user.type !== "root") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, userName, password, type } = await req.json();

    // Validate required fields
    if (!name || !userName || !password || !type) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    const allowedTypes = ["poster", "seller", "sellerAdmin", "root"] as const;
    type UserType = (typeof allowedTypes)[number];

    // Validate type
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid user type." },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { userName } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        userName,
        password: hashedPassword,
        type,
      },
    });

    if (user?.type === "seller") {
      await prisma.sellerLimit.create({
        data: {
          sellerId: user.id,
        },
      });
    }
    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_USER_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
