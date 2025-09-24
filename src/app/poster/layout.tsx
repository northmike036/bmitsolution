import { ReactNode } from "react";
import Logout from "@/components/ui/logout";
import { Button } from "@/components/ui/button";
import PosterNotification from "@/components/notification/posterNotification";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function PosterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/poster">
          <h1 className="text-2xl font-bold text-gray-800">
            📤 Poster Dashboard
          </h1>
        </Link>
        <div className="flex items-center space-x-2">
          <PosterNotification userId={session?.user.id} />
          <Link href="/poster/add-lead">
            <Button className="cursor-pointer">Add Lead</Button>
          </Link>
          <Link href="/poster/leads/inbox">
            <Button className="cursor-pointer">Leads</Button>
          </Link>
          <Logout className="cursor-pointer" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
