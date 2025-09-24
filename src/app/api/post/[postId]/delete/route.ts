import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RouteContext } from "../../../../../../types/RouteContext";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

type PostRouteContext = RouteContext<{ postId: string }>;

export async function POST(req: NextRequest, context: PostRouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.type !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { postId } = await context.params;
    const body = await req.json();
    const { reason } = body;
    const sellerId = session.user.id;

    // 1️⃣ Fetch the post ===>
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, posterId: true, deleted: true },
    });

    console.log(post);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.deleted) {
      return NextResponse.json(
        { error: "Post already deleted" },
        { status: 400 }
      );
    }

    // 2️⃣ Mark post as deleted ==>
    await prisma.post.update({
      where: { id: postId },
      data: { deleted: true },
    });

    // 3️⃣ Create deletion record ===>
    await prisma.postDeletion.create({
      data: {
        postId,
        sellerId,
        reason,
      },
    });

    // 4️⃣ Create Notification for poster ==>
    const notification = await prisma.notification.create({
      data: {
        userId: post.posterId,
        type: "POST_DELETION",
        message: "Your post was deleted by a seller.",
        metadata: { postId, reason, sellerId },
      },
    });

    // 5️⃣ Trigger Pusher notification
    await pusher.trigger(`user-${post.posterId}`, "notification", notification);

    return NextResponse.json({ success: true, notification });
  } catch (err) {
    console.error("[POST_DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
