"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  seller_id: string;
  currency?: string;
  image_url?: string | null;
};

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCheckout() {
      try {
        const savedCart = localStorage.getItem("hnc_cart");

        if (!savedCart) {
          router.push("/cart");
          return;
        }

        const parsedCart: CartItem[] = JSON.parse(savedCart);

        if (!Array.isArray(parsedCart) || parsedCart.length === 0) {
          router.push("/cart");
          return;
        }

        setCart(parsedCart);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        setEmail(user.email ?? "");
      } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load checkout.");
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [router]);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function handleCheckout() {
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setProcessing(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      /*
       * For now, HangoutsNChill accepts NGN checkout only.
       * This prevents accidentally combining products with
       * different currencies in one Paystack transaction.
       */
      const currencies = [
        ...new Set(
          cart.map((item) => (item.currency ?? "NGN").toUpperCase())
        ),
      ];

      if (currencies.length > 1) {
        throw new Error(
          "Your cart contains products with different currencies. Please checkout products with the same currency together."
        );
      }

      const currency = currencies[0] ?? "NGN";

      if (currency !== "NGN") {
        throw new Error(
          "Only NGN checkout is currently supported."
        );
      }

      const amountInNaira = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const amountInKobo = Math.round(amountInNaira * 100);

      if (amountInKobo <= 0) {
        throw new Error("Invalid checkout amount.");
      }

      /*
       * Send the complete cart to our server.
       *
       * The server will put these items into Paystack metadata
       * and later use the same metadata during verification to
       * create the individual orders for each seller.
       */
      const items = cart.map((item) => ({
        productId: item.id,
        sellerId: item.seller_id,
        quantity: item.quantity,
        unitPrice: item.price,
        title: item.title,
      }));

      const response = await fetch(
        "/api/paystack/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount: amountInKobo,
            currency,
            userId: user.id,
            items,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.status) {
        throw new Error(
          result.error ||
            result.message ||
            "Unable to initialize payment."
        );
      }

      const authorizationUrl =
        result.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack did not return a payment URL."
        );
      }

      window.location.href = authorizationUrl;
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );

      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-gray-500">
            Preparing checkout...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/cart"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Cart
        </Link>

        <h1 className="mt-5 text-4xl font-bold">
          Checkout
        </h1>

        <p className="mt-2 text-gray-500">
          Complete your purchase securely with Paystack.
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">
            Order Summary
          </h2>

          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div>
                  <p className="font-semibold">
                    {item.title}
                  </p>

                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>

                  <p className="text-sm text-gray-500">
                    Unit price: ₦
                    {item.price.toLocaleString()}
                  </p>
                </div>

                <p className="font-semibold">
                  ₦
                  {(
                    item.price * item.quantity
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-xl font-bold">
            <span>Total</span>

            <span>
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <label className="mb-2 block font-semibold">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={handleCheckout}
            disabled={processing}
            className="mt-6 w-full rounded-lg bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing
              ? "Connecting to Paystack..."
              : `Pay ₦${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </main>
  );
}