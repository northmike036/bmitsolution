"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

type SellerSummary = {
  totalRequests: number;
  requestsToday: number;
  requestsYesterday: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  requestsLastMonth: number;
  remainingQuota: number;
};

export default function SellerSummary() {
  const [summary, setSummary] = useState<SellerSummary | null>(null);

  console.log(summary);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await fetch("/api/seller/summary");
      const data = await res.json();
      setSummary(data);
    };
    fetchSummary();
  }, []);

  if (!summary) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading seller summary...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Requests</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {summary.totalRequests}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests Today</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {summary.requestsToday}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests Yesterday</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {summary.requestsYesterday}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests This Week</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {summary.requestsThisWeek}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests This Month</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {summary.requestsThisMonth}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests Last Month</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {summary.requestsLastMonth}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remaining Daily Quota</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {summary.remainingQuota - summary.requestsToday}
        </CardContent>
      </Card>
    </div>
  );
}
