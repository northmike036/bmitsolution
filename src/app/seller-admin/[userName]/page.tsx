"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
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
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

type SellerStats = {
  id: string;
  name: string;
  userName: string;
  isActive: boolean;
  dailyLimit: number;
  cooldownSecs: number;
  dailyCount: number;
  weeklyCount: number;
};

export default function SellerAdminControlPage() {
  const { userName } = useParams();
  const { toast } = useToast();

  const [seller, setSeller] = useState<SellerStats | null>(null);
  const [dailyLimit, setDailyLimit] = useState("");
  const [cooldownSecs, setCooldownSecs] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const router = useRouter();

  const fetchSeller = async () => {
    const res = await fetch(`/api/admin/seller/${userName}/control`);
    const data = await res.json();
    setSeller(data.seller);
    setDailyLimit(String(data.seller.limitProfile.dailyLimit));
    setCooldownSecs(String(data.seller.limitProfile.cooldownSecs));
  };

  const updateLimits = async () => {
    const res = await fetch(`/api/admin/seller/${userName}/control`, {
      method: "PUT",
      body: JSON.stringify({
        dailyLimit: Number(dailyLimit),
        cooldownSecs: Number(cooldownSecs),
      }),
    });

    if (res.ok) {
      toast({ title: "Limits updated" });
      fetchSeller();
    } else {
      toast({ title: "Failed to update limits", variant: "destructive" });
    }
  };

  const changePassword = async () => {
    const res = await fetch(`/api/admin/update/${userName}/password`, {
      method: "POST",
      body: JSON.stringify({ newPassword: password }),
    });

    if (res.ok) {
      toast({ title: "Password updated" });
      setPassword("");
      setShowPasswordDialog(false);
    } else {
      toast({ title: "Failed to update password", variant: "destructive" });
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
        title: `Seller ${seller?.isActive ? "Terminated" : "Activated"}`,
      });
      setSeller((prevState) => {
        if (!prevState || !prevState.userName) return prevState;
        return {
          ...prevState,
          isActive: !prevState.isActive,
        };
      });
    }
  };

  const deleteUser = async () => {
    const res = await fetch("/api/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: seller?.id }),
    });
    if (!res.ok) {
      toast({
        title: "Error",
        description: "Something went wrong deleting user",
        variant: "destructive",
      });
    } else {
      toast({ title: "User Deleted Successfully" });
      router.push("/admin/users/seller");
    }
  };

  useEffect(() => {
    fetchSeller();
  }, []);

  if (!seller) return <p>Loading...</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4">
      <Card>
        <CardContent className="space-y-2 p-4">
          <h3 className="text-lg font-semibold">Performance</h3>
          <p>Today’s Claims: {seller.dailyCount}</p>
          <p>This Week’s Claims: {seller.weeklyCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-2 p-4">
          <h2 className="text-xl font-semibold">
            Seller: {seller.name} (@{seller.userName})
          </h2>

          <div className="space-y-2">
            <Label>Daily Limit</Label>
            <Input
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />

            <Label>Cooldown (seconds)</Label>
            <Input
              value={cooldownSecs}
              onChange={(e) => setCooldownSecs(e.target.value)}
            />

            <Button onClick={updateLimits} className="cursor-pointer">
              Update Limits
            </Button>
          </div>

          <div className="flex gap-2 pt-4">
            <Dialog
              open={showPasswordDialog}
              onOpenChange={setShowPasswordDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent>
                <h3 className="text-lg font-semibold">Change Password</h3>
                <div className="mt-2 space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button onClick={changePassword}>Update Password</Button>
                </div>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={seller.isActive ? "destructive" : "default"}
                  className="cursor-pointer"
                >
                  {seller.isActive ? "Terminate Seller" : "Active Seller"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <p>
                  {seller.isActive
                    ? "This will Terminate the seller and their Activity."
                    : "This will Acivate the seller and their Activity."}
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
                <p>
                  This action will permanently delete user and user activity
                </p>
                <DialogFooter className="pt-4">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteUser}>
                    Confirm
                  </AlertDialogAction>
                </DialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
