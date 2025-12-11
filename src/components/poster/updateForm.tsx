"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UpdateForm({
  phoneNumber,
  message,
  clientName,
  agentName,
  location,
  rent,
  screenshot,
  id,
  postType,
}: {
  phoneNumber: string;
  message: string;
  clientName: string;
  agentName: string;
  location: string;
  rent: string;
  screenshot: string;
  id: string;
  postType: string;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    phoneNumber,
    message,
    clientName,
    agentName,
    location,
    rent,
    screenshot,
    postType,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/post/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: form.phoneNumber.trim(),
          message: form.message.trim(),
          clientName: form.clientName.trim(),
          agentName: form.agentName.trim(),
          location: form.location.trim(),
          rent: form.rent.trim(),
          screenshot: form.screenshot.trim(),
          postType: form.postType.trim(),
          postId: id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      toast({
        title: "Success",
        description: "Lead Update Successfully!",
      });

      setForm({
        phoneNumber: "",
        message: "",
        clientName: "",
        agentName: "",
        location: "",
        rent: "",
        screenshot: "",
        postType: "",
      });
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "Unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-3 max-w-xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-center text-xl font-semibold">Update Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Client Name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          required
        />
        <Select
          value={form.postType}
          onValueChange={(value) => setForm({ ...form, postType: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Post Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fb">Facebook (FB)</SelectItem>
            <SelectItem value="cl">Craigslist (CL)</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Agent Name"
          value={form.agentName}
          onChange={(e) => setForm({ ...form, agentName: e.target.value })}
          required
        />
        <Input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          required
        />
        <Input
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <Input
          type="text"
          placeholder="Rent"
          value={form.rent}
          onChange={(e) => setForm({ ...form, rent: e.target.value })}
          required
        />
        <Input
          type="text"
          placeholder="Screenshot"
          value={form.screenshot}
          onChange={(e) => setForm({ ...form, screenshot: e.target.value })}
          required
        />
        <Textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
