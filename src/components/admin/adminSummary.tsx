"use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function AdminSummary() {
//   const [summary, setSummary] = useState<any>(null);

//   useEffect(() => {
//     const fetchSummary = async () => {
//       const res = await fetch("/api/admin/summary");
//       const data = await res.json();
//       setSummary(data);
//     };

//     fetchSummary();
//   }, []);

//   if (!summary) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//         {Array.from({ length: 15 }).map((_, i) => (
//           <Skeleton key={i} className="h-25 w-full rounded-xl bg-gray-300" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//       <StatCard title="Total Users" value={summary.totalUsers} />
//       <StatCard title="Total Posters" value={summary.totalPosters} />
//       <StatCard title="Total Sellers" value={summary.totalSellers} />
//       <StatCard title="Total Leads" value={summary.totalPosts} />
//       <StatCard title="Deleted Leads" value={summary.deletedLeads} />
//       <StatCard title="Today Leads" value={summary.posts.today} />
//       <StatCard title="yesterday Leads" value={summary.posts.yesterday} />
//       <StatCard title="Leads This Week" value={summary.posts.thisWeek} />
//       <StatCard title="Leads This Month" value={summary.posts.thisMonth} />
//       <StatCard title="Leads Last Month" value={summary.posts.lastMonth} />
//       <StatCard title="Available Leads" value={summary.availableLeads} />
//       <StatCard title="Daily claim" value={summary.claims.today} />
//       <StatCard title="yesterday claim" value={summary.claims.yesterday} />
//       <StatCard title="Claim This Week" value={summary.claims.thisWeek} />
//       <StatCard title="Claim This month" value={summary.claims.thisMonth} />

//       <div className="col-span-full">
//         <h3 className="text-lg font-semibold mb-2">Top Posters</h3>
//         <ul className="space-y-1">
//           {summary.topPosters.map((user: any) => (
//             <li key={user.id}>
//               {user.name} — {user._count.posts} Leads
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// function StatCard({ title, value }: { title: string; value: number }) {
//   return (
//     <Card>
//       <CardContent className="px-4 py-2">
//         <div className="text-sm text-gray-500">{title}</div>
//         <div className="text-2xl font-bold">{value}</div>
//       </CardContent>
//     </Card>
//   );
// }

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

export default function AdminSummary({ children }: { children: ReactNode }) {
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
