"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Notifications load failed:", error);
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, is_read: true }
          : item
      )
    );
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading notifications...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="mx-auto max-w-4xl">

        <h1 className="mb-8 text-4xl font-bold">
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            🎉 You're all caught up!
          </div>
        ) : (
          <div className="space-y-5">

            {notifications.map((notification) => (

              <div
                key={notification.id}
                className={`rounded-2xl p-6 shadow ${
                  notification.is_read
                    ? "bg-white"
                    : "bg-blue-50"
                }`}
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-xl font-bold">
                      {notification.title}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      {notification.message}
                    </p>

                    <p className="mt-3 text-sm text-gray-400">
                      {new Date(
                        notification.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                  {!notification.is_read && (
                    <button
                      onClick={() =>
                        markAsRead(notification.id)
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Mark Read
                    </button>
                  )}

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </main>
  );
}