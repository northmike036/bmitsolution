// app/poster/page.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function LeadForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    phoneNumber: "",
    message: "",
    clientName: "",
    agentName: "",
    location: "",
    rent: "",
    screenshot: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/post", {
        method: "POST",
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      toast({
        title: "Success",
        description: "Lead Added Successfully!",
      });

      setForm({
        phoneNumber: "",
        message: "",
        clientName: "",
        agentName: "",
        location: "",
        rent: "",
        screenshot: "",
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
    <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-center text-xl font-semibold">Submit Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Client Name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          required
        />
        <Input
          type="text"
          placeholder="Agent Name"
          value={form.agentName}
          onChange={(e) => setForm({ ...form, agentName: e.target.value })}
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
          placeholder="Description"
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
