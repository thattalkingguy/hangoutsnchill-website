"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProduct(params.get("product"));
  }, []);

  const successRedirect = product
    ? `/dashboard?product=${product}`
    : "/dashboard";

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    if (!data.session) {
      setLoading(false);
      alert("Login was not completed. Please try again.");
      return;
    }

    router.replace(successRedirect);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Log in to your HangoutsNChill account
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            href={`/auth/signup${product ? `?product=${product}` : ""}`}
            className="font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to HnC Home
          </Link>
        </div>
      </div>
    </main>
  );
}