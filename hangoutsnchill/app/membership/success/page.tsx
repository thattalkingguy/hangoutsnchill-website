"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type VerificationState =
  | "verifying"
  | "success"
  | "error";

type MembershipResult = {
  success?: boolean;
  message?: string;
  error?: string;
  membership?: {
    id?: string;
    status?: string;
    plan_name?: string;
    plan_slug?: string;
    current_period_end?: string | null;
  };
};

export default function MembershipSuccessPage() {
  const [state, setState] =
    useState<VerificationState>("verifying");

  const [message, setMessage] = useState(
    "Confirming your membership payment..."
  );

  const [membership, setMembership] =
    useState<MembershipResult["membership"]>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function verifyMembership() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const reference = params.get("reference");

        if (!reference) {
          if (!cancelled) {
            setState("error");
            setMessage(
              "No Paystack payment reference was found."
            );
          }
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          if (!cancelled) {
            setState("error");
            setMessage(
              "Your HnC session has expired. Please sign in again and check your membership."
            );
          }
          return;
        }

        const response = await fetch(
          "/api/membership/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              reference,
            }),
          }
        );

        const data: MembershipResult =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.message ||
              data?.error ||
              "We could not verify your membership payment."
          );
        }

        if (!cancelled) {
          setMembership(data.membership);
          setState("success");
          setMessage(
            "Your membership payment has been verified successfully."
          );
        }
      } catch (error) {
        console.error(
          "Membership payment verification error:",
          error
        );

        if (!cancelled) {
          setState("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "We could not verify your membership payment."
          );
        }
      }
    }

    verifyMembership();

    return () => {
      cancelled = true;
    };
  }, []);

  const formattedPeriodEnd =
    membership?.current_period_end
      ? new Date(
          membership.current_period_end
        ).toLocaleDateString("en-NG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          {state === "verifying" && (
            <>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-3xl">
                ⏳
              </div>

              <h1 className="text-3xl font-bold">
                Confirming your payment
              </h1>

              <p className="mt-4 text-slate-300">
                {message}
              </p>

              <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-400" />
              </div>
            </>
          )}

          {state === "success" && (
            <>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
                ✓
              </div>

              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                Membership Activated
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Welcome to HnC
              </h1>

              <p className="mt-4 text-slate-300">
                {message}
              </p>

              {membership && (
                <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">
                      Membership
                    </span>

                    <span className="font-semibold">
                      {membership.plan_name ||
                        "HnC Membership"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-slate-400">
                      Status
                    </span>

                    <span className="font-semibold capitalize text-emerald-400">
                      {membership.status ||
                        "active"}
                    </span>
                  </div>

                  {formattedPeriodEnd && (
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="text-slate-400">
                        Current period ends
                      </span>

                      <span className="font-semibold">
                        {formattedPeriodEnd}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Go to HnC
                </Link>

                <Link
                  href="/membership"
                  className="rounded-xl border border-white/15 px-5 py-3 text-center font-semibold transition hover:bg-white/5"
                >
                  View Membership
                </Link>

                <Link
                  href="/ai"
                  className="rounded-xl border border-white/15 px-5 py-3 text-center font-semibold transition hover:bg-white/5"
                >
                  Ask Ayo
                </Link>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-3xl">
                !
              </div>

              <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
                Verification needs attention
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Payment received, but confirmation failed
              </h1>

              <p className="mt-4 leading-7 text-slate-300">
                {message}
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Please do not pay again. Your payment
                reference can be checked from the HnC
                membership system.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/membership"
                  className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Return to Membership
                </Link>

                <Link
                  href="/"
                  className="rounded-xl border border-white/15 px-5 py-3 text-center font-semibold transition hover:bg-white/5"
                >
                  Go to HnC
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}