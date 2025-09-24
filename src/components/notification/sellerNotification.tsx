"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";

export default function SellerNotification({
  userId,
}: {
  userId: string | undefined;
}) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const markAllRead = () => {
    localNotifications.forEach((n) => {
      if (!n.read) markAsRead(n.id);
    });
  };

  const handleClickNotification = (id: string) => {
    markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-500 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {localNotifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            localNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.read === false) {
                    handleClickNotification(n.id);
                  }
                  setOpen(false);
                }}
                className={`cursor-pointer rounded-md border p-2 transition ${
                  n.read ? "bg-white" : "border-blue-200 bg-blue-50"
                } hover:bg-gray-50`}
              >
                <Link href={`/seller/notification/${n.id}`}>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </Link>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
