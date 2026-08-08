"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  title: string;
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

    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,is_read")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Topbar notifications load failed:", error);
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }
  }

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-5">

      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <div className="relative">

        <button
          onClick={() => setOpen(!open)}
          className="relative text-3xl"
        >
          🔔

          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-4 w-80 rounded-xl bg-white shadow-xl border z-50">

            <div className="border-b p-4 font-bold">
              Notifications
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`border-b p-4 ${
                    item.is_read
                      ? "bg-white"
                      : "bg-blue-50"
                  }`}
                >
                  {item.title}
                </div>
              ))
            )}

            <Link
              href="/notifications"
              className="block p-4 text-center font-semibold text-blue-600 hover:bg-gray-50"
            >
              View All Notifications
            </Link>

          </div>
        )}

      </div>

    </header>
  );
}