"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setOrders(data || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            My Orders
          </h1>

          <Link
            href="/marketplace"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Marketplace
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-bold">
              No orders yet
            </h2>

            <p className="mt-3 text-gray-500">
              Buy your first product from the marketplace.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">

            <table className="w-full">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Reference</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t"
                  >
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