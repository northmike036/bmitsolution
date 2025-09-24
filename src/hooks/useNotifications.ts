// src/hooks/useNotifications.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { pusherClient } from "@/lib/pusherClient";

export interface Notification {
  id: string;
  type: string;
  message: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
  read: boolean;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const res = await fetch(`/api/notifications`);
    if (res.ok) {
      const data: Notification[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Subscribe to user-specific channel
    const userChannel = pusherClient.subscribe(`user-${userId}`);
    const globalChannel = pusherClient.subscribe("global-announcements");

    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount((c) => c + 1);
      }
    };

    userChannel.bind("notification", handleNotification);
    globalChannel.bind("notification", handleNotification);

    return () => {
      userChannel.unbind("notification", handleNotification);
      globalChannel.unbind("notification", handleNotification);
      pusherClient.unsubscribe(`user-${userId}`);
      pusherClient.unsubscribe("global-announcements");
    };
  }, [userId, fetchNotifications]);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userId) return;
    await fetch(`/api/notifications/read-all?userId=${userId}`, {
      method: "POST",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
