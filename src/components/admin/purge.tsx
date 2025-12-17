"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

type PurgeResult = {
  from: string;
  to: string;
  deletedPosts: number;
  deletedClaims: number;
  deletedDeletionLogs: number;
};

const AdminPurge = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<PurgeResult | null>(null);
  const { toast } = useToast();

  const valid = Boolean(from && to && new Date(from) <= new Date(to));

  const onConfirm = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/leads/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to purge");
      }
      setResult(data as PurgeResult);
      toast({ title: "Purge completed" });
    } catch (err: any) {
      toast({
        title: "Purge failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="text-lg font-semibold">
              Permanent Delete by Date Range
            </p>
            <p className="text-sm text-gray-500">
              This permanently deletes posts and their related claims and
              deletion logs. This action cannot be undone.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-600">From</label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">To</label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              disabled={!valid || loading}
              onClick={() => setConfirmOpen(true)}
              className="cursor-pointer"
            >
              Permanently Delete
            </Button>
            {!valid && (
              <p className="text-sm text-gray-500">
                Select a valid date range.
              </p>
            )}
          </div>

          {result && (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Results</p>
              <p>From: {result.from}</p>
              <p>To: {result.to}</p>
              <p>Deleted Posts: {result.deletedPosts}</p>
              <p>Deleted Claims: {result.deletedClaims}</p>
              <p>Deleted Deletion Logs: {result.deletedDeletionLogs}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Permanent Delete</DialogTitle>
            <DialogDescription>
              You are about to permanently delete all posts created between{" "}
              {from || "?"} and {to || "?"}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPurge;
