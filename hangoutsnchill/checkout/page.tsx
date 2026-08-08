"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image_url?: string | null;
  quantity: number;
  seller_id: string;
  currency: string;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("hnc_cart");

    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [cart]);

  async function payNow() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      alert("Please login first.");
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      setLoading(false);
      return;
    }

    // MVP: One seller and one product per checkout
    const item = cart[0];

    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: total * 100,
        userId: user.id,
        sellerId: item.seller_id,
        productId: Number(item.id),
        quantity: item.quantity,
        unitPrice: item.price,
      }),
    });

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(result.error || "Unable to initialize payment.");
      return;
    }

    window.location.href = result.data.authorization_url;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-bold">
          Checkout
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 shadow">
            <h2 className="text-2xl font-bold">
              Your cart is empty
            </h2>

            <Link
              href="/marketplace"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow">

            {cart.map((item) => (
              <div
                key={item.id}
                className="mb-6 flex justify-between border-b pb-4"
              >
                <div>
                  <h2 className="font-bold">
                    {item.title}
                  </h2>

                  <p>
                    Qty: {item.quantity}
                  </p>
                </div>

                <div>
                  ₦{item.price * item.quantity}
                </div>
              </div>
            ))}

            <div className="mt-8 flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span>₦{total}</span>
            </div>

            <button
              onClick={payNow}
              disabled={loading}
              className="mt-8 w-full rounded-lg bg-green-600 py-4 text-lg font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Connecting to Paystack..." : "Pay with Paystack"}
            </button>

          </div>
        )}
      </div>
    </main>
  );
}