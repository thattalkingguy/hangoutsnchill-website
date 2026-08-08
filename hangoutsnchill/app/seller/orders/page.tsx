"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  buyer_id: string;
  amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const response = await supabase.auth.getUser();
    const user = response.data?.user;

    if (!user) {
      setLoading(false);
      setLoadError("You must be signed in to view seller orders.");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load seller orders:", error);
      setLoadError(error.message || "Unable to load seller orders.");
      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">
          Orders Received
        </h1>

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow">
            Loading...
          </div>
        ) : loadError ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-bold text-red-600">
              Error loading orders
            </h2>
            <p className="mt-3 text-gray-500">{loadError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            No customer orders yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-4">
                      {order.id.slice(0, 8)}
                    </td>

                    <td className="p-4">
                      {order.currency} {order.amount}
                    </td>

                    <td className="p-4">
                      {order.payment_status}
                    </td>

                    <td className="p-4">
                      {order.order_status}
                    </td>

                    <td className="p-4">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}