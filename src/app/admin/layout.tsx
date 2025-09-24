import AdminLayout from "@/components/layouts/admin-layout";
import { ReactNode } from "react";

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
