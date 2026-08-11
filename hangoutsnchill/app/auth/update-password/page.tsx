"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function prepareRecovery() {
      try {
        /*
         * Supabase can return authentication errors in the URL hash.
         * Check those first so we can give the user a useful message.
         */
        const hash = window.location.hash;

        if (hash) {
          const hashParams = new URLSearchParams(
            hash.startsWith("#") ? hash.substring(1) : hash
          );

          const authError = hashParams.get("error");
          const errorCode = hashParams.get("error_code");
          const description = hashParams.get("error_description");

          if (authError || errorCode) {
            if (mounted) {
              setErrorMessage(
                description
                  ? decodeURIComponent(description.replace(/\+/g, " "))
                  : "This password reset link is invalid or has expired."
              );

              setLoading(false);
            }

            return;
          }
        }

        /*
         * PKCE password recovery:
         * if Supabase sends ?code=..., exchange it for a session.
         */
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error(
              "Password recovery code exchange failed:",
              error
            );

            if (mounted) {
              setErrorMessage(error.message);
              setLoading(false);
            }

            return;
          }
        }

        /*
         * Check whether Supabase now has a valid recovery session.
         */
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          setReady(true);
        } else {
          setErrorMessage(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Password recovery initialization failed:",
          error
        );

        if (mounted) {
          setErrorMessage(
            "We could not verify this password reset link. Please request a new one."
          );

          setLoading(false);
        }
      }
    }

    prepareRecovery();

    /*
     * Listen for Supabase recovery events.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setErrorMessage("");
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Password update failed:", error);

      setSaving(false);
      alert(error.message);
      return;
    }

    setSaving(false);

    alert("Password updated successfully.");

    await supabase.auth.signOut();

    router.replace("/auth/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold">
            Preparing password reset...
          </h1>

          <p className="mt-3 text-gray-500">
            Please wait while we verify your reset link.
          </p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow">
          <h1 className="text-center text-2xl font-bold">
            Reset Link Problem
          </h1>

          <p className="mt-3 text-center text-gray-500">
            {errorMessage ||
              "This password reset link is no longer valid."}
          </p>

          <Link
            href="/auth/forgot-password"
            className="mt-6 block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Request a New Reset Link
          </Link>

          <Link
            href="/auth/login"
            className="mt-4 block text-center font-semibold text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-bold">
          Create New Password
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Choose a new password for your HnC account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
        >
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}