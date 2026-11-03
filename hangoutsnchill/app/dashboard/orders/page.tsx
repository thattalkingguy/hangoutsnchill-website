
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
  paystack_reference: string | null;
  checkout_reference: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyOrder, setBusyOrder] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setLoadError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setLoadError("Please sign in to view your orders.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Buyer orders error:", error);
      setLoadError("Unable to load your orders. Please try again.");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function confirmReceipt(orderId: string) {
    if (busyOrder) return;

    const confirmed = window.confirm(
      "Please confirm that you have received this order. This will release the seller's held earnings."
    );

    if (!confirmed) return;

    setBusyOrder(orderId);
    setMessage("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(
        `/api/marketplace/orders/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "confirm_receipt" }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to confirm receipt.");
      }

      setMessage(result.message || "Receipt confirmed successfully.");
      await loadOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to confirm receipt."
      );
    } finally {
      setBusyOrder(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-3 text-4xl font-bold">My Orders</h1>

        <p className="mb-8 text-gray-600">
          Confirm receipt only after you have received your order.
        </p>

        {message && (
          <div className="mb-5 rounded-xl bg-white p-4 shadow">
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading orders...</p>
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
          <div className="rounded-xl bg-white p-10 shadow">
            <h2 className="text-2xl font-bold">No orders yet</h2>
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
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {order.currency || "NGN"}{" "}
                      {Number(order.amount).toLocaleString()}
                    </h2>

                    <p className="mt-2 text-gray-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p>
                      Payment:{" "}
                      <strong className="text-green-700">
                        {order.payment_status}
                      </strong>
                    </p>

                    <p className="mt-2">
                      Order: <strong>{order.order_status}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-500">Checkout reference:</p>
                  <p className="break-all font-mono text-sm">
                    {order.checkout_reference ||
                      order.paystack_reference ||
                      "Not available"}
                  </p>
                </div>

                <div className="mt-5">
                  {order.payment_status === "paid" &&
                    order.order_status === "delivered" && (
                      <button
                        onClick={() => confirmReceipt(order.id)}
                        disabled={busyOrder !== null}
                        className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {busyOrder === order.id
                          ? "Confirming..."
                          : "Confirm receipt"}
                      </button>
                    )}

                  {order.order_status === "processing" && (
                    <p className="text-sm text-gray-600">
                      Your order is being processed.
                    </p>
                  )}

                  {order.order_status === "delivered" && (
                    <p className="mt-3 text-sm text-amber-700">
                      The seller has marked this order as delivered. Please
                      confirm receipt when you have received it.
                    </p>
                  )}

                  {order.order_status === "completed" && (
                    <p className="font-medium text-green-700">
                      Receipt confirmed. Thank you for shopping on HnC.
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
