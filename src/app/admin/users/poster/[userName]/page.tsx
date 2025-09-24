"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type PosterStats = {
  user: {
    id: string;
    name: string;
    userName: string;
    createdAt: string;
    isActive: boolean;
  };
  totalPosts: number;
  postsToday: number;
  postsThisWeek: number;
};

export default function PosterControlPage() {
  const { userName } = useParams();
  const { toast } = useToast();
  const [poster, setPoster] = useState<PosterStats | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const router = useRouter();

  const fetchPoster = async () => {
    const res = await fetch(`/api/admin/poster/${userName}/summary`);
    const data = await res.json();
    setPoster(data);
  };

  const handlePasswordChange = async () => {
    const res = await fetch(`/api/admin/update/${userName}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Error",
        description: data.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "Password updated" });
      setNewPassword("");
      setPasswordDialogOpen(false);
    }
  };

  const deleteUser = async () => {
    const res = await fetch("/api/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: poster?.user?.id }),
    });
    if (!res.ok) {
      toast({
        title: "Error",
        description: "Something went wrong deleting user",
        variant: "destructive",
      });
    } else {
      toast({ title: "User Deleted Successfully" });
      router.push("/admin/users/poster");
    }
  };

  const handleTerminate = async () => {
    const res = await fetch(`/api/admin/update/${userName}/terminate`, {
      method: "POST",
    });
    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Error",
        description: data.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Poster ${poster?.user.isActive ? "Terminated" : "Activated"}`,
      });
      setPoster((prevData) => {
        if (!prevData || !prevData.user) return prevData;

        return {
          ...prevData,
          user: {
            ...prevData.user,
            isActive: !prevData.user.isActive,
          },
        };
      });
    }
  };

  useEffect(() => {
    fetchPoster();
  }, []);

  if (!poster) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Poster: {poster.user.name}</h1>
        <p className="text-gray-600">Username: {poster.user.userName}</p>
        <p className="text-gray-500 text-sm">
          Joined: {format(new Date(poster.user.createdAt), "MMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">Today's Leads</h3>
            <p className="text-2xl">{poster.postsToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">This Week Leads</h3>
            <p className="text-2xl">{poster.postsThisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold">Total Leads</h3>
            <p className="text-2xl">{poster.totalPosts}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-2">
        {/* Password Update Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Poster Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button onClick={handlePasswordChange} className="cursor-pointer">
                Update Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Terminate Poster Alert */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={poster.user.isActive ? "destructive" : "default"}
              className="cursor-pointer"
            >
              {poster.user.isActive ? "Terminate Poster" : "Active Poster"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <p>
              {poster.user.isActive
                ? "This will Terminate the poster and their Activity."
                : "This will Acivate the poster and their Activity."}
            </p>
            <DialogFooter className="pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTerminate}>
                Confirm
              </AlertDialogAction>
            </DialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* delete user */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="cursor-pointer">
              Delete User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <p>This action will permanently delete user and user activity</p>
            <DialogFooter className="pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteUser}>
                Confirm
              </AlertDialogAction>
            </DialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
