// src/hooks/useNotification.ts
"use client";

import { useEffect, useState } from "react";
import type { Notification } from "./useNotifications";

export function useNotification(id?: string) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchNotification = async () => {
      setLoading(true);
      const res = await fetch(`/api/notifications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setNotification(data);
      }
      setLoading(false);
    };

    fetchNotification();
  }, [id]);

  return { notification, loading };
}
