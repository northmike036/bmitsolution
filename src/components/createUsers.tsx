"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function AdminCreateUser() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    userName: "",
    password: "",
    type: "poster",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Something went wrong",
        });
      } else {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setForm({ name: "", userName: "", password: "", type: "poster" });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-10 max-w-md">
      <CardContent>
        <h2 className="mb-6 text-center text-2xl font-semibold">
          Create New User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <Input
            placeholder="Username"
            value={form.userName}
            onChange={(e) => handleChange("userName", e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
          />
          <Select
            value={form.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="poster">Poster</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
              <SelectItem value="sellerAdmin">Seller Admin</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            className="w-full cursor-pointer bg-gray-700 text-white"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
