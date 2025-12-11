// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnalyticContainer from "@/components/admin/AdminSummary";
import AnalyticsDashboard from "@/components/admin/AdminSummaryV2";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "root") {
    redirect("/login");
  }

  return (
    <AnalyticContainer>
      <AnalyticsDashboard />
    </AnalyticContainer>
  );
}
