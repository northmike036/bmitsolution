import { ReactNode } from "react";
import Link from "next/link";
import Logout from "../ui/logout";
import SellerNotification from "../notification/sellerNotification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const navLinks = [
  { name: "Dashboard", href: "/seller" },
  { name: "Inbox", href: "/seller/inbox" },
];

export default async function SellerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-4 flex flex-col justify-between min-h-screen">
        <div>
          <h1 className="text-2xl font-bold text-center mb-6">Seller Panel</h1>
          <nav className="space-y-2 flex flex-col justify-center items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-md font-semibold"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 py-3 overflow-y-auto">
        <div className="flex justify-end items-center space-x-2 mb-2">
          <SellerNotification userId={session?.user.id} />
          <div>
            <Logout className="cursor-pointer" />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
