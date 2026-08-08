"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    averageOrder: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);

    const [
      usersResult,
      productsResult,
      ordersResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("amount"),
    ]);

    const revenue =
      ordersResult.data?.reduce(
        (sum, order) => sum + Number(order.amount),
        0
      ) ?? 0;

    const orderCount = ordersResult.data?.length ?? 0;

    setStats({
      totalRevenue: revenue,
      totalOrders: orderCount,
      totalProducts: productsResult.count ?? 0,
      totalUsers: usersResult.count ?? 0,
      averageOrder:
        orderCount === 0 ? 0 : Math.round(revenue / orderCount),
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading analytics...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="mx-auto max-w-7xl">

        <h1 className="mb-10 text-5xl font-bold">
          Marketplace Analytics
        </h1>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Revenue
            </p>

            <h2 className="mt-3 text-3xl font-bold text-green-600">
              ₦{stats.totalRevenue}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Orders
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {stats.totalOrders}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Products
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {stats.totalProducts}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Users
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {stats.totalUsers}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">
              Average Order
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-600">
              ₦{stats.averageOrder}
            </h2>
          </div>

        </div>

        <div className="mt-10 rounded-2xl bg-white p-10 shadow">

          <h2 className="mb-4 text-3xl font-bold">
            Platform Status
          </h2>

          <ul className="space-y-3 text-lg">

            <li>✅ Marketplace is operational</li>

            <li>✅ Payments are connected to Paystack</li>

            <li>✅ Wallet system is active</li>

            <li>✅ Withdrawal system is active</li>

            <li>✅ Admin dashboard is active</li>

          </ul>

        </div>

      </div>

    </main>
  );
}