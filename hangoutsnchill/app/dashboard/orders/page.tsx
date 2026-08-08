"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  paystack_reference: string;
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
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-bold">
          My Orders
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 shadow">
            <h2 className="text-2xl font-bold">
              No orders yet
            </h2>

            <p className="mt-3 text-gray-500">
              Your purchases will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      ₦{order.amount}
                    </h2>

                    <p className="text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p>
                      Payment:
                      <strong className="ml-2 text-green-600">
                        {order.payment_status}
                      </strong>
                    </p>

                    <p>
                      Order:
                      <strong className="ml-2">
                        {order.order_status}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Reference:
                  </p>

                  <p className="font-mono text-sm">
                    {order.paystack_reference}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}