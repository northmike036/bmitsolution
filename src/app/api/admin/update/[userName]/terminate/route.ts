import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type tParams = Promise<{ userName: string }>;

export async function POST(_: Request, { params }: { params: tParams }) {
  const { userName } = await params;
  const user = await prisma.user.findUnique({ where: { userName } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { userName },
    data: { isActive: !user.isActive },
  });

  const message = user.isActive ? "User is Terminated" : "User is Activated";

  return NextResponse.json({ success: true, message });
}
