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

  const router = useRouter();

  const successRedirect = product
    ? `/dashboard?product=${product}`
    : "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProduct(params.get("product"));
  }, []);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const username = email.split("@")[0];

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            full_name: fullName,
            username,
            role: "member",
            avatar_url: "",
            bio: "",
            country: "",
            wallet_balance: 0,
          },
        ]);

      if (profileError) {
        console.error(profileError);
      }
    }

    setLoading(false);

    alert("🎉 Account created successfully!");

    router.push(successRedirect);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-center text-3xl font-bold text-gray-900">
          Create Your Account
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Join HangoutsNChill and start growing today
        </p>

        <form onSubmit={handleSignUp} className="mt-8 space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href={`/auth/login${product ? `?product=${product}` : ""}`}
            className="text-blue-600 hover:underline"
          >
            Login
          </a>
        </p>

      </div>
    </main>
  );
}