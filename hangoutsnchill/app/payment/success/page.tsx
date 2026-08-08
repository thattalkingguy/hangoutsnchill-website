"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    async function verifyPayment() {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference) {
        setStatus("No payment reference found.");
        return;
      }

      try {
        const response = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          localStorage.removeItem("hnc_cart");

          setStatus("🎉 Payment verified successfully!");
        } else {
          setStatus(
            `❌ ${result.message || "Payment verification failed."}`
          );
        }
      } catch (error) {
        console.error(error);

        setStatus("❌ Unable to verify payment.");
      }
    }

    verifyPayment();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-lg">
        <h1 className="text-4xl font-bold text-green-600">
          Payment Successful
        </h1>

        <p className="mt-6 text-lg text-gray-700">
          {status}
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/marketplace"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}