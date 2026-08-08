"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  quantity?: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("hnc_cart");

    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  function removeItem(id: string) {
    const updated = cart.filter((item) => item.id !== id);

    setCart(updated);

    localStorage.setItem("hnc_cart", JSON.stringify(updated));
  }

  function clearCart() {
    localStorage.removeItem("hnc_cart");
    setCart([]);
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity ?? 1),
    0
  );

  return (
    <main className="mx-auto max-w-6xl p-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-500">
            Review your selected products.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Continue Shopping
        </Link>

      </div>

      {cart.length === 0 ? (
        <div className="mt-12 rounded-xl bg-white p-12 text-center shadow">
          <h2 className="text-2xl font-bold">
            Your cart is empty
          </h2>

          <p className="mt-4 text-gray-500">
            Browse the marketplace and add products.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-10 space-y-5">

            {cart.map((item) => (

              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white p-6 shadow"
              >

                <div>
                  <h2 className="text-xl font-bold">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-blue-600 font-semibold">
                    ₦{item.price}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-white"
                >
                  Remove
                </button>

              </div>

            ))}

          </div>

          <div className="mt-10 rounded-xl bg-white p-8 shadow">

            <div className="flex justify-between text-2xl font-bold">

              <span>Total</span>

              <span>₦{total}</span>

            </div>

            <div className="mt-8 flex gap-4">

              <button
                onClick={clearCart}
                className="rounded-lg bg-gray-300 px-6 py-3"
              >
                Empty Cart
              </button>

              <Link
                href="/checkout"
                className="rounded-lg bg-green-600 px-6 py-3 text-white"
              >
                Checkout
              </Link>

            </div>

          </div>
        </>
      )}

    </main>
  );
}