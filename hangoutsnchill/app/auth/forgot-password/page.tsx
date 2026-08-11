"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo,
      }
    );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold">
          Reset Password
        </h1>

        {sent ? (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              If an account exists for this email, a password
              reset link has been sent.
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Check your email and follow the link to create a
              new password.
            </p>

            <Link
              href="/auth/login"
              className="mt-6 inline-block font-semibold text-blue-600 hover:underline"
            >
              ← Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-center text-gray-500">
              Enter your account email and we'll send you a
              password reset link.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-4"
            >
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
