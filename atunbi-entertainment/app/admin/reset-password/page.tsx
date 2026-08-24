"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkRecoverySession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setError(
          "This password reset link is invalid or has expired. Please request a new reset link."
        );
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setError("");
        setCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Your password has been changed successfully. Redirecting you to Admin Login..."
    );

    await supabase.auth.signOut();

    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 2000);
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#F7F1E3] px-6 py-12 text-[#17130F]">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
          <div className="w-full rounded-[2rem] border border-[#B8954A]/20 bg-white/70 p-8 text-center shadow-xl sm:p-10">
            <div className="text-3xl font-black tracking-[0.08em]">
              ÀTÚNBÍ
            </div>

            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-[#A47B22]">
              Entertainment
            </div>

            <p className="mt-8 text-sm text-[#62574B]">
              Verifying password reset session...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1E3] px-6 py-12 text-[#17130F]">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-[#B8954A]/20 bg-white/70 p-8 shadow-xl sm:p-10">
          <div className="text-center">
            <div className="text-3xl font-black tracking-[0.08em]">
              ÀTÚNBÍ
            </div>

            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-[#A47B22]">
              Entertainment
            </div>

            <h1 className="mt-8 text-3xl font-black">
              Create New Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#62574B]">
              Choose a new password for your ÀTÚNBÍ Entertainment admin
              account.
            </p>
          </div>

          {error ? (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-800">
              <p className="font-bold">Password Reset Error</p>

              <p className="mt-1">{error}</p>

              <a
                href="/admin/login"
                className="mt-4 inline-block font-bold text-[#A47B22] hover:underline"
              >
                ← Return to Admin Login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  New Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 pr-20 outline-none focus:border-[#A47B22]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A47B22] hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[#766A5E]">
                  Minimum 8 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Confirm Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 pr-20 outline-none focus:border-[#A47B22]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A47B22] hover:underline"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-[#B8954A]/40 bg-[#FFF7E6] px-4 py-4 text-sm leading-6 text-[#17130F]">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#17130F] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Changing Password..." : "Change Password"}
              </button>

              <a
                href="/admin/login"
                className="block text-center text-sm font-bold text-[#A47B22] hover:underline"
              >
                ← Back to Admin Login
              </a>
            </form>
          )}

          <div className="mt-8 border-t border-[#17130F]/10 pt-6 text-center text-xs text-[#766A5E]">
            ÀTÚNBÍ Entertainment • Secure Admin Area
          </div>
        </div>
      </div>
    </main>
  );
}