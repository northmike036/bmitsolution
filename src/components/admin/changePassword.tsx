"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const canSubmit =
    !!currentPassword &&
    !!newPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 8;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to change password");
      toast({ title: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <p className="text-lg font-semibold">Change Password</p>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || loading}
              className="cursor-pointer"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
            {!canSubmit && (
              <p className="text-sm text-gray-500">
                Ensure passwords match and are at least 8 characters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
