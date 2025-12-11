// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path if needed
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/components/admin/AdminSummaryV2";
import AdminSummary from "@/components/admin/AdminSummary";
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "root") {
    redirect("/login");
  }

  return (
    <AdminSummary>
      <AnalyticsDashboard />
    </AdminSummary>
  );
}
