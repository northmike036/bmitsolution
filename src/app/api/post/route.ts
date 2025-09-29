import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import parsePhoneNumber from "libphonenumber-js";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and type is a poster
  if (!session || session.user.type !== "poster") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      phoneNumber,
      message,
      clientName,
      agentName,
      location,
      rent,
      screenshot,
    } = await req.json();

    // Validate inputs
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Phone number and message are required." },
        { status: 400 },
      );
    }
    // agentName: "",
    // location: "",
    // rent: "",
    // screenshot: "",
    // Validate phone number format (e.g., +1 555-123-4567)
    // const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    // if (!phoneRegex.test(phoneNumber)) {
    //   return NextResponse.json(
    //     { error: "Invalid phone number format." },
    //     { status: 400 }
    //   );
    // }

    const parsed = parsePhoneNumber(phoneNumber, "US");
    if (!parsed?.isValid()) {
      return NextResponse.json(
        { error: "Invalid phone number format." },
        { status: 400 },
      );
    }
    const formattedNumber = parsed.number;
    const foundedPost = await prisma.post.findUnique({
      where: {
        phone: formattedNumber,
      },
    });

    if (foundedPost) {
      return NextResponse.json(
        { error: "Phone Number Already Added It's A Duplicate" },
        { status: 400 },
      );
    }
    // Create post
    const post = await prisma.post.create({
      data: {
        phone: formattedNumber,
        message,
        clientName,
        posterId: session.user.id,
        agentName,
        location,
        rent,
        screenshot,
      },
    });

    return NextResponse.json(
      { message: "Lead created successfully.", post },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
