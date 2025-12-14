"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

type Summary = {
  today: number;
  yesterday: number;
  weekly: number;
  monthly: number;
  lastMonth: number;
  total: number;
  deletedLeads: number;
  fbLeads: number;
  clLeads: number;
};

export default function PosterSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const res = await fetch("/api/poster/summary");
      const data = await res.json();
      setSummary(data);
      setLoading(false);
    };

    fetchSummary();
  }, []);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Today's Leads"
        value={summary?.today ?? 0}
        loading={loading}
      />
      <StatCard
        label="Yesterday Leads"
        value={summary?.yesterday ?? 0}
        loading={loading}
      />
      <StatCard
        label="Weekly Leads"
        value={summary?.weekly ?? 0}
        loading={loading}
      />
      <StatCard
        label="Monthly Leads"
        value={summary?.monthly ?? 0}
        loading={loading}
      />
      <StatCard
        label="Last Month Leads"
        value={summary?.lastMonth ?? 0}
        loading={loading}
      />
      <StatCard
        label="Total Leads"
        value={summary?.total ?? 0}
        loading={loading}
      />
      <StatCard
        label="Deleted Leads"
        value={summary?.deletedLeads ?? 0}
        loading={loading}
      />
      <StatCard
        label="Facebook Leads"
        value={summary?.fbLeads ?? 0}
        loading={loading}
      />
      <StatCard
        label="Craigslist Leads"
        value={summary?.clLeads ?? 0}
        loading={loading}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Card className="text-center shadow-md">
      <CardContent className="py-6">
        <h3 className="text-muted-foreground mb-1 text-sm">{label}</h3>
        <div className="text-3xl font-bold">{loading ? "..." : value}</div>
      </CardContent>
    </Card>
  );
}
