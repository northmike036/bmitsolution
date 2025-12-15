"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TeamPerformanceResponse } from "../../../types/teamTypes";
import { notFound } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TeamPerformance({ teamId }: { teamId: string }) {
  const [data, setData] = useState<TeamPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    (async () => {
      const res = await fetch(`/api/admin/teams/${teamId}/performance`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    })();
  }, [teamId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data found</div>;

  const chartData = data.memberBreakdown.map((m) => ({
    name: m.name,
    weekly: m.weekly,
  }));

  return (
    <div className="space-y-6 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Daily Leads" value={data.summary.dailyPosts} />
        <StatCard title="Weekly Leads" value={data.summary.weeklyPosts} />
        <StatCard title="Monthly Leads" value={data.summary.monthlyPosts} />
        <StatCard title="Last Month" value={data.summary.lastMonthPosts} />
      </div>

      {/* Performance Chart */}
      <Card className="p-4">
        <h2 className="mb-4 text-xl font-semibold">Weekly Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="weekly" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Member Breakdown Table */}
      <Card className="p-4">
        <h2 className="mb-4 text-xl font-semibold">Members Performance</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Daily</th>
              <th className="p-2">Weekly</th>
              <th className="p-2">Monthly</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.memberBreakdown.map((m) => (
              <tr key={m.id} className="hover:bg-muted/40 border-b">
                <td className="p-2">{m.name}</td>
                <td className="p-2">{m.daily}</td>
                <td className="p-2">{m.weekly}</td>
                <td className="p-2">{m.monthly}</td>
                <td className="p-2 font-semibold">{m.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Top Posters */}
      <Card className="p-4">
        <h2 className="mb-4 text-xl font-semibold">Top Posters</h2>
        <ul className="space-y-2">
          {data.topPosters.map((p, idx) => (
            <li
              key={p.id}
              className="flex justify-between rounded-xl border p-2"
            >
              <span>
                {idx + 1}. {p.name} ({p.userName})
              </span>
              <span className="font-bold">{p.total}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4 text-center">
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
