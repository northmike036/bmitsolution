import { ReactNode } from "react";
import Logout from "@/components/ui/logout";
import Link from "next/link";

export default async function SellerAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/seller-admin">
          <h1 className="text-2xl font-bold text-gray-800">
            Seller Admin Dashboard
          </h1>
        </Link>
        <div className="flex items-center space-x-2">
          <Logout className="cursor-pointer" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
