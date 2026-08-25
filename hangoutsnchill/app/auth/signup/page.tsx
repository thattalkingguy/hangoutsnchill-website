"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProduct(params.get("product"));
  }, []);

  const successRedirect = product
    ? `/dashboard?product=${encodeURIComponent(product)}`
    : "/dashboard";

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const cleanName = fullName.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName) {
        setMessage("Please enter your full name.");
        setLoading(false);
        return;
      }

      if (!cleanEmail) {
        setMessage("Please enter your email address.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);

        const details = [
          error.message,
          error.code ? `Code: ${error.code}` : "",
          error.status ? `Status: ${error.status}` : "",
        ]
          .filter(Boolean)
          .join(" | ");

        setMessage(details || "Unable to create your account.");
        setLoading(false);
        return;
      }

      const user = data?.user;

      if (!user) {
        console.error("Supabase returned no user:", data);

        setMessage(
          "Your signup request was received, but no user account was returned. Please try again."
        );
        setLoading(false);
        return;
      }

      /*
       * Supabase may require email confirmation.
       * In that case a user can exist without an active session.
       */
      if (data.session) {
        const usernameBase = cleanEmail.split("@")[0];

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              full_name: cleanName,
              username: usernameBase,
              role: "member",
              avatar_url: "",
              bio: "",
              country: "",
              wallet_balance: 0,
            },
            {
              onConflict: "id",
            }
          );

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        setMessage("Account created successfully. Redirecting...");

        setTimeout(() => {
          router.push(successRedirect);
        }, 700);

        return;
      }

      /*
       * Email confirmation is enabled.
       */
      setMessage(
        "Account created successfully! Please check your email to confirm your account before logging in."
      );

      setLoading(false);
    } catch (error) {
      console.error("Unexpected signup error:", error);

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Something went wrong while creating your account. Please try again."
        );
      }

      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Create Your Account
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Join HangoutsNChill and start growing today
        </p>

        {message && (
          <div
            className={`mt-6 rounded-lg border p-4 text-sm ${
              message.toLowerCase().includes("successfully")
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSignUp} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href={`/auth/login${product ? `?product=${encodeURIComponent(product)}` : ""}`}
            className="text-blue-600 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}