"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    withdrawals: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [
      usersResult,
      productsResult,
      ordersResult,
      withdrawalsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("amount"),
      supabase
        .from("withdrawals")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    const revenue =
      ordersResult.data?.reduce(
        (sum, order) => sum + Number(order.amount),
        0
      ) ?? 0;

    setStats({
      users: usersResult.count ?? 0,
      products: productsResult.count ?? 0,
      orders: ordersResult.data?.length ?? 0,
      withdrawals: withdrawalsResult.count ?? 0,
      revenue,
    });
  }

  const cards = [
    {
      title: "Users",
      value: stats.users,
      icon: "👥",
      color: "bg-blue-600",
      href: "/admin/users",
    },
    {
      title: "Products",
      value: stats.products,
      icon: "📦",
      color: "bg-green-600",
      href: "/admin/products",
    },
    {
      title: "Orders",
      value: stats.orders,
      icon: "🛒",
      color: "bg-purple-600",
      href: "/admin/orders",
    },
    {
      title: "Revenue",
      value: `₦${stats.revenue}`,
      icon: "💰",
      color: "bg-yellow-500",
      href: "/admin/orders",
    },
    {
      title: "Pending Withdrawals",
      value: stats.withdrawals,
      icon: "💸",
      color: "bg-red-600",
      href: "/admin/withdrawals",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="mx-auto max-w-7xl">

        <h1 className="mb-2 text-5xl font-bold">
          Super Admin
        </h1>

        <p className="mb-10 text-gray-600">
          Welcome to the HangoutsNChill Control Center
        </p>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white ${card.color}`}
              >
                {card.icon}
              </div>

              <h2 className="text-2xl font-bold">
                {card.title}
              </h2>

              <p className="mt-3 text-4xl font-bold">
                {card.value}
              </p>
            </Link>
          ))}

        </div>

      </div>

    </main>
  );
}