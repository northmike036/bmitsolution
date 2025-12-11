"use client";
import { useEffect, useState, ReactNode } from "react";
import {
  Users,
  FileText,
  Trash2,
  CheckCircle,
  UserCheck,
  Inbox,
  Facebook,
  SquircleDashed,
} from "lucide-react";

function StatCard({
  label,
  value,
  children,
}: {
  label: string;
  value: string | number;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-center rounded-xl bg-blue-100 p-3 text-blue-600">
        {/* icon placeholder - switch to <Icon /> if you import lucide-react */}
        <div className="h-5 w-5">{children}</div>
      </div>
      <div className="text-center">
        <p className="text-muted-foreground text-sm text-nowrap">{label}</p>
        <p className="text-2xl font-semibold">{value ?? 0}</p>
      </div>
    </div>
  );
}

export default function AnalyticWrapper({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalPosters: 0,
    totalSellers: 0,
    totalLeads: 0,
    deletedLeads: 0,
    availableLeads: 0,
    fbLeads: 0,
    clLeads: 0,
  });

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/admin/dashboard`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSummary({
        totalUsers: data.users.totalUsers,
        totalPosters: data.users.totalPosters,
        totalSellers: data.users.totalSellers,
        totalLeads: data.leads.totalLeads,
        deletedLeads: data.leads.deletedLeads,
        availableLeads: data.leads.availableLeads,
        fbLeads: data.leads.fbLeads,
        clLeads: data.leads.clLeads,
      });
    } catch (err: any) {
      console.error("Failed to load dashboard:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full items-center gap-4 overflow-x-auto p-2">
        <StatCard label="Total Users" value={summary.totalUsers}>
          <Users />
        </StatCard>
        <StatCard label="Total Posters" value={summary.totalPosters}>
          <FileText />
        </StatCard>
        <StatCard label="Total Sellers" value={summary.totalSellers}>
          <UserCheck />
        </StatCard>
        <StatCard label="Total Leads" value={summary.totalLeads}>
          <Inbox />
        </StatCard>
        <StatCard label="Deleted Leads" value={summary.deletedLeads}>
          <Trash2 />
        </StatCard>
        <StatCard label="Available Leads" value={summary.availableLeads}>
          <CheckCircle />
        </StatCard>
        <StatCard label="FB Leads" value={summary.fbLeads}>
          <Facebook />
        </StatCard>
        <StatCard label="CL Leads" value={summary.clLeads}>
          <SquircleDashed />
        </StatCard>
      </div>
      {error && <div className="text-red-600">Error: {error}</div>}
      {children}
    </div>
  );
}
