
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
  funds_status: string;
  created_at: string;
  delivered_at: string | null;
  buyer_confirmed_at: string | null;
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyOrder, setBusyOrder] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setLoadError(null);

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    const token = sessionData.session?.access_token;

    if (sessionError || !token) {
      setLoadError("Please sign in to view your seller orders.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/marketplace/seller/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load orders.");
      }

      setOrders(result.orders || []);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  async function markDelivered(orderId: string) {
    if (busyOrder) return;

    setBusyOrder(orderId);
    setMessage("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "mark_delivered" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update this order.");
      }

      setMessage(result.message || "Order marked as delivered.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update order."
      );
    } finally {
      setBusyOrder(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-3 text-4xl font-bold">Orders Received</h1>

        <p className="mb-8 text-gray-600">
          Mark an order as delivered when the customer has received it.
          Your earnings remain held until the buyer confirms receipt.
        </p>

        {message && (
          <div className="mb-5 rounded-xl bg-white p-4 shadow">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow">
            Loading orders...
          </div>
        ) : loadError ? (
          <div className="rounded-xl bg-white p-8 text-red-600 shadow">
            {loadError}
            <button
              onClick={loadOrders}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            No eligible marketplace orders yet.
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">
                      Order #{order.id.slice(0, 8)}
                    </h2>

                    <p className="mt-2 text-2xl font-bold">
                      {order.currency || "NGN"}{" "}
                      {Number(order.amount).toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p>
                      Payment: <strong>{order.payment_status}</strong>
                    </p>
                    <p className="mt-2">
                      Order: <strong>{order.order_status}</strong>
                    </p>
                    <p className="mt-2">
                      Seller funds: <strong>{order.funds_status}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t pt-5">
                  {order.order_status === "processing" &&
                    order.payment_status === "paid" &&
                    order.funds_status === "held" && (
                      <button
                        onClick={() => markDelivered(order.id)}
                        disabled={busyOrder !== null}
                        className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {busyOrder === order.id
                          ? "Updating..."
                          : "Mark as delivered"}
                      </button>
                    )}

                  {order.order_status === "delivered" && (
                    <p className="font-medium text-amber-700">
                      Delivered. Awaiting buyer confirmation before earnings
                      are released.
                    </p>
                  )}

                  {order.order_status === "completed" && (
                    <p className="font-medium text-green-700">
                      Completed. Buyer confirmed receipt.
                    </p>
                  )}

                  {order.funds_status === "disputed" && (
                    <p className="font-medium text-red-700">
                      This order's funds are under dispute.
                    </p>
                  )}

                  {order.funds_status === "refunded" && (
                    <p className="font-medium text-gray-600">
                      This order has been refunded.
                    </p>
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
