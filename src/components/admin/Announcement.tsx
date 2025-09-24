"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function AnnouncementForm() {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendAnnouncement = async () => {
    if (!message.trim()) return;
    setLoading(true);

    try {
      await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      setMessage("");
      toast({
        title: "Success",
        description: "Announcement sent!",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Submission failed",
        description: err.message || "Unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 mt-3 border rounded-lg">
      <h2 className="text-lg font-semibold">Send Announcement</h2>
      <Textarea
        placeholder="Enter announcement message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button onClick={sendAnnouncement} disabled={loading}>
        {loading ? "Sending..." : "Send Announcement"}
      </Button>
    </div>
  );
}
