"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";

type Poster = {
  id: string;
  name: string;
  userName: string;
  createdAt: string;
  dailyPosts: number;
  yesterdayPosts: number;
  weeklyPosts: number;
  monthlyPosts: number;
  lastMonthPosts: number;
  _count: {
    posts: number;
  };
};

export default function AdminPosterListPage() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosters = async () => {
      const res = await fetch("/api/admin/poster");
      const data = await res.json();
      setPosters(data);
      setLoading(false);
    };

    fetchPosters();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto space-y-4 p-4">
        <h2 className="text-2xl font-bold">All Posters</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="h-50 w-full rounded-xl bg-gray-300" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-4 p-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">All Posters</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posters.length === 0 ? (
          <p>No posters found.</p>
        ) : (
          posters.map((poster) => (
            <Card key={poster.id}>
              <CardContent className="space-y-1 px-4">
                <div className="font-medium">
                  {poster.name} (@{poster.userName})
                </div>

                <div>
                  <div className="text-sm font-semibold">
                    Daily Leads: {poster.dailyPosts}
                  </div>
                  <div className="text-sm font-semibold">
                    Yesterday Leads: {poster.yesterdayPosts}
                  </div>
                  <div className="text-sm font-semibold">
                    weekly Leads: {poster.weeklyPosts}
                  </div>
                  <div className="text-sm font-semibold">
                    Monthly Leads: {poster.monthlyPosts}
                  </div>
                  <div className="text-sm font-semibold">
                    Last Month Leads: {poster.lastMonthPosts}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Total Leads: {poster._count.posts} · Joined:{" "}
                  {format(new Date(poster.createdAt), "MMM d, yyyy")}
                </div>
                <div className="flex justify-end pt-1">
                  <Link href={`/admin/users/poster/${poster.userName}`}>
                    <Button className="cursor-pointer bg-blue-500 hover:bg-blue-700">
                      View More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
