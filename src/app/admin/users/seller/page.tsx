"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

type Seller = {
  id: string;
  name: string;
  userName: string;
  createdAt: string;
  dailyClaims: number;
  yesterdayClaims: number;
  weeklyClaims: number;
  lastMonthClaims: number;
  monthlyClaims: number;
  _count: {
    claims: number;
    requestLogs: number;
  };
};

export default function AdminSellerListPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("");
  const [cooldownSecs, setCooldownSecs] = useState("");
  const { toast } = useToast();

  const handleLimitChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const dayLimit = Number(dailyLimit);
      const timeLimit = Number(cooldownSecs);
      if (!dayLimit || !timeLimit) {
        toast({ title: "Enter valid Number", variant: "destructive" });
        return;
      }
      const res = await fetch("/api/admin/seller/update-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyLimit: dayLimit,
          cooldownSecs: timeLimit,
        }),
      });
      if (res.ok) {
        toast({ title: "Successfully updated" });
        setDailyLimit("");
        setCooldownSecs;
        ("");
        setLimitDialogOpen(false);
      } else {
        toast({ title: "something went wrong" });
      }
    } catch (error) {
      setLimitDialogOpen(false);
      toast({ title: "something went wrong", variant: "destructive" });
    }
  };
  useEffect(() => {
    const fetchSellers = async () => {
      const res = await fetch("/api/admin/seller");
      const data = await res.json();
      setSellers(data);
      setLoading(false);
    };

    fetchSellers();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto space-y-4 p-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">All Sellers</h2>
          <div className="space-x-3">
            <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  Set Limit All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Seller Limit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLimitChange}>
                  <div className="mb-2 space-y-2">
                    <Label>Daily Limit</Label>
                    <Input
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      placeholder="Enter Limit"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cooldown (seconds)</Label>
                    <Input
                      value={cooldownSecs}
                      onChange={(e) => setCooldownSecs(e.target.value)}
                      placeholder="Enter Cooldown seconds"
                      required
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button className="cursor-pointer" type="submit">
                      Update
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
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
        <h2 className="text-2xl font-bold">All Sellers</h2>
        <div className="space-x-3">
          <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                Set Limit All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Seller Limit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLimitChange}>
                <div className="mb-2 space-y-2">
                  <Label>Daily Limit</Label>
                  <Input
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    placeholder="Enter Limit"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cooldown (seconds)</Label>
                  <Input
                    value={cooldownSecs}
                    onChange={(e) => setCooldownSecs(e.target.value)}
                    placeholder="Enter Cooldown seconds"
                    required
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button className="cursor-pointer" type="submit">
                    Update
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sellers.length === 0 ? (
          <p>No sellers found.</p>
        ) : (
          sellers.map((seller) => (
            <Card key={seller.id}>
              <CardContent className="space-y-1 px-4">
                <div className="font-medium">
                  {seller.name} (@{seller.userName})
                </div>
                <div className="text-sm font-semibold">
                  Daily Claimed: {seller.dailyClaims}
                </div>
                <div className="text-sm font-semibold">
                  Yesterday Claimed: {seller.yesterdayClaims}
                </div>
                <div className="text-sm font-semibold">
                  Weekly Claimed: {seller.weeklyClaims}
                </div>
                <div className="text-sm font-semibold">
                  Monthly Claimed: {seller.monthlyClaims}
                </div>
                <div className="text-sm font-semibold">
                  Last Month Claimed: {seller.lastMonthClaims}
                </div>
                <div className="text-sm text-gray-500">
                  Total Claims: {seller._count.claims} · Requests:{" "}
                  {seller._count.requestLogs} · Joined:{" "}
                  {format(new Date(seller.createdAt), "MMM d, yyyy")}
                </div>
                <div className="flex justify-end">
                  <Link href={`/admin/users/seller/${seller.userName}`}>
                    <Button className="cursor-pointer bg-blue-500 hover:bg-blue-700">
                      View Profile
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
