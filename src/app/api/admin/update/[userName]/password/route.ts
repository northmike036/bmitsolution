import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

type tParams = Promise<{ userName: string }>;

export async function POST(req: Request, { params }: { params: tParams }) {
  const { newPassword } = await req.json();
  const { userName } = await params;

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const hashed = await hash(newPassword, 10);

  await prisma.user.update({
    where: { userName },
    data: { password: hashed, sessionVersion: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
