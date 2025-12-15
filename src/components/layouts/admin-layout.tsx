"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logout from "../ui/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

const navLinks = [
  { name: "Dashboard", href: "/admin" },
  { name: "Poster List", href: "/admin/users/poster" },
  { name: "Seller List", href: "/admin/users/seller" },
  { name: "Teams", href: "/admin/teams" },
  { name: "Leads", href: "/admin/leads/inbox" },
  { name: "Announcement", href: "/admin/announcement" },
  { name: "Export Leads", href: "/admin/export" },
  { name: "Change Password", href: "/admin/profile/change-password" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* Sidebar */}
      <aside className="hidden min-h-screen w-64 flex-col justify-between space-y-4 bg-white p-4 shadow-md md:flex">
        <div>
          <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>
          <nav className="flex flex-col items-center justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-md block w-full rounded-lg px-6 py-2 font-semibold text-gray-900 transition hover:bg-gray-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-2 py-3 md:px-6">
        <div className="mb-2 flex items-center justify-end space-x-2">
          <Link href="/admin/users/create">
            <button className="button-85" role="button">
              Create User
            </button>
          </Link>
          <div>
            <Logout className="cursor-pointer" />
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <DropdownMenuItem>{link.name}</DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
