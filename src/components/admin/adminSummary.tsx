"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSummary() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch("/api/admin/summary");
      const data = await res.json();
      setSummary(data);
    };

    fetchSummary();
  }, []);

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-25 w-full rounded-xl bg-gray-300" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <StatCard title="Total Users" value={summary.totalUsers} />
      <StatCard title="Total Posters" value={summary.totalPosters} />
      <StatCard title="Total Sellers" value={summary.totalSellers} />
      <StatCard title="Total Leads" value={summary.totalPosts} />
      <StatCard title="Deleted Leads" value={summary.deletedLeads} />
      <StatCard title="Today Leads" value={summary.posts.today} />
      <StatCard title="yesterday Leads" value={summary.posts.yesterday} />
      <StatCard title="Leads This Week" value={summary.posts.thisWeek} />
      <StatCard title="Leads This Month" value={summary.posts.thisMonth} />
      <StatCard title="Leads Last Month" value={summary.posts.lastMonth} />
      <StatCard title="Available Leads" value={summary.availableLeads} />
      <StatCard title="Daily claim" value={summary.claims.today} />
      <StatCard title="yesterday claim" value={summary.claims.yesterday} />
      <StatCard title="Claim This Week" value={summary.claims.thisWeek} />
      <StatCard title="Claim This month" value={summary.claims.thisMonth} />

      <div className="col-span-full">
        <h3 className="text-lg font-semibold mb-2">Top Posters</h3>
        <ul className="space-y-1">
          {summary.topPosters.map((user: any) => (
            <li key={user.id}>
              {user.name} — {user._count.posts} Leads
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="px-4 py-2">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
