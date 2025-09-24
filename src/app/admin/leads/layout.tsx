import { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InboxNavButton from "@/components/admin/InboxNavButton";

const AdminLeadsWrapper = async ({ children }: { children: ReactNode }) => {
  const totalLeads = await prisma.post.count({
    where: {
      deleted: false,
    },
  });
  const deletedLeads = await prisma.post.count({
    where: {
      deleted: true,
    },
  });

  return (
    <div>
      <div className="space-2 flex gap-2">
        <div>
          <Link href="/admin/leads/inbox" className="">
            <InboxNavButton
              type="Inbox"
              path="/admin/leads/inbox"
              amount={totalLeads}
            />
          </Link>
        </div>
        <div>
          <Link href="/admin/leads/trash">
            <InboxNavButton
              type="Trash"
              path="/admin/leads/trash"
              amount={deletedLeads}
            />
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AdminLeadsWrapper;
