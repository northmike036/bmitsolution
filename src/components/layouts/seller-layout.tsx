import { ReactNode } from "react";
import Link from "next/link";
import Logout from "../ui/logout";
import SellerNotification from "../notification/sellerNotification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientSessionWatcher } from "../ClientSessionWatcher";

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
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* Sidebar */}
      <aside className="flex min-h-screen w-64 flex-col justify-between space-y-4 bg-white p-4 shadow-md">
        <div>
          <h1 className="mb-6 text-center text-2xl font-bold">Seller Panel</h1>
          <nav className="flex flex-col items-center justify-center space-y-2">
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
      <main className="flex-1 overflow-y-auto px-6 py-3">
        <div className="mb-2 flex items-center justify-end space-x-2">
          <SellerNotification userId={session?.user.id} />
          <div>
            <Logout className="cursor-pointer" />
          </div>
        </div>
        {children}
      </main>
      <ClientSessionWatcher interval={60000} />
    </div>
  );
}
