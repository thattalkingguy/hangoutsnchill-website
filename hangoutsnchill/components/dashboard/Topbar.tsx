"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
};

export default function Topbar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
const {
  data: { user },
} = await supabase.auth.getUser();

console.log("TOPBAR USER:", user?.id);

    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,message,is_read")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Topbar notifications load failed:", error);
      setNotifications([]);
      return;
    }

    setNotifications(data || []);
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to mark notification as read:", error);
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, is_read: true }
          : item
      )
    );
  }

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full text-2xl hover:bg-gray-100"
          aria-label="Notifications"
        >
          🔔

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-xl border bg-white shadow-xl">
            <div className="border-b px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">
                  Notifications
                </h2>

                {unreadCount > 0 && (
                  <span className="text-sm text-gray-500">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`block w-full border-b p-4 text-left hover:bg-gray-50 ${
                      item.is_read
                        ? "bg-white"
                        : "bg-blue-50"
                    }`}
                  >
                    <div className="font-semibold">
                      {item.title}
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {item.message}
                    </div>

                    {!item.is_read && (
                      <div className="mt-2 text-xs font-semibold text-blue-600">
                        New notification
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t p-4 text-center font-semibold text-blue-600 hover:bg-gray-50"
            >
              View All Notifications
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}