// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnalyticWrapper from "@/components/admin/AdminAnalyticsWrapper";
import AnalyticsDashboard from "@/components/admin/adminSummaryV2";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.type !== "root") {
    redirect("/login");
  }

  return (
    <AnalyticWrapper>
      <AnalyticsDashboard />
    </AnalyticWrapper>
  );
}
