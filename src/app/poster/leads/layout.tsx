import { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InboxNavButton from "@/components/admin/InboxNavButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

const posterInboxLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getServerSession(authOptions);
  // Only authenticated can access here
  if (!session || session.user.type !== "poster") {
    return notFound();
  }
  const totalLeads = await prisma.post.count({
    where: {
      poster: {
        id: session?.user.id,
      },
      deleted: false,
    },
  });
  const deletedLeads = await prisma.post.count({
    where: {
      poster: {
        id: session?.user.id,
      },
      deleted: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-2 flex gap-2">
        <div>
          <Link href="/poster/leads/inbox" className="">
            <InboxNavButton
              type="Inbox"
              path="/poster/leads/inbox"
              amount={totalLeads}
            />
          </Link>
        </div>
        <div>
          <Link href="/poster/leads/trash">
            <InboxNavButton
              type="Trash"
              path="/poster/leads/trash"
              amount={deletedLeads}
            />
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
};

export default posterInboxLayout;
