"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MembershipPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  billing_interval: string;
  price: number;
  currency: string;
  active: boolean;
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MembershipPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    loadMembershipPage();
  }, []);

  async function loadMembershipPage() {
    setLoading(true);
    setError("");

    try {
      const [
        plansResponse,
        sessionResponse,
      ] = await Promise.all([
        fetch("/api/membership/plans", {
          method: "GET",
          cache: "no-store",
        }),
        supabase.auth.getSession(),
      ]);

      const plansData = await plansResponse.json();

      if (!plansResponse.ok || !plansData.success) {
        throw new Error(
          plansData?.message || "Unable to load membership plans."
        );
      }

      setPlans(plansData.plans || []);

      const session = sessionResponse.data.session;

      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    } catch (err) {
      console.error("Membership page load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load membership plans."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(plan: MembershipPlan) {
    setError("");

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setError(
        sessionError.message ||
          "Unable to verify your login session."
      );
      return;
    }

    const session = sessionData.session;

    if (!session?.access_token) {
      router.push(
        `/auth/login?redirect=/membership&product=${encodeURIComponent(
          plan.slug
        )}`
      );
      return;
    }

    setLoadingPlan(plan.slug);

    try {
      const response = await fetch(
        "/api/membership/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            planSlug: plan.slug,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to start your membership subscription."
        );
      }

      const authorizationUrl =
        data?.data?.authorization_url ||
        data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack did not return a payment authorization URL."
        );
      }

      window.location.href = authorizationUrl;
    } catch (err) {
      console.error(
        "Membership subscription initialization error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start your membership subscription."
      );

      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-300">
            HnC MEMBERSHIP
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Choose Your HnC Access
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Connect, learn, build, earn and access the parts of
            HnC that match your goals.
          </p>

          {userEmail && (
            <p className="mt-4 text-sm text-slate-400">
              Signed in as{" "}
              <span className="font-semibold text-white">
                {userEmail}
              </span>
            </p>
          )}
        </header>

        {error && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <section className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-slate-300">
              Loading HnC membership plans...
            </p>
          </section>
        ) : plans.length === 0 ? (
          <section className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Membership is temporarily unavailable
            </h2>

            <p className="mt-3 text-slate-400">
              Please check back shortly.
            </p>
          </section>
        ) : (
          <section className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const isLoading = loadingPlan === plan.slug;

              const isPro = plan.slug === "hnc-pro";
              const isLodge = plan.slug === "hnc-lodge";
              const isFounder = plan.slug === "hnc-founder";

              return (
                <article
                  key={plan.id}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border bg-white/[0.04] p-7 shadow-2xl ${
                    isFounder
                      ? "border-amber-400/40"
                      : isLodge
                        ? "border-cyan-400/30"
                        : "border-white/10"
                  }`}
                >
                  {isLodge && (
                    <div className="absolute right-5 top-5 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                      PRIVATE NETWORK
                    </div>
                  )}

                  {isFounder && (
                    <div className="absolute right-5 top-5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                      FOUNDER ACCESS
                    </div>
                  )}

                  {isPro && (
                    <div className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                      PREMIUM
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                      HnC
                    </p>

                    <h2 className="mt-3 text-3xl font-black">
                      {plan.name}
                    </h2>

                    <p className="mt-4 min-h-[72px] text-sm leading-6 text-slate-400">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-7">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black">
                        {formatPrice(
                          plan.price,
                          plan.currency
                        )}
                      </span>

                      <span className="pb-1 text-sm text-slate-400">
                        / month
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                    {isPro && (
                      <>
                        <Feature>
                          Premium HnC tools
                        </Feature>
                        <Feature>
                          Premium opportunities
                        </Feature>
                        <Feature>
                          Priority support
                        </Feature>
                        <Feature>
                          Defined Founder request access
                        </Feature>
                      </>
                    )}

                    {isLodge && (
                      <>
                        <Feature>
                          Private HnC network
                        </Feature>
                        <Feature>
                          Private opportunities
                        </Feature>
                        <Feature>
                          Deal rooms
                        </Feature>
                        <Feature>
                          Member introductions
                        </Feature>
                        <Feature>
                          Ayo Lodge Concierge
                        </Feature>
                        <Feature>
                          Defined Founder request access
                        </Feature>
                      </>
                    )}

                    {isFounder && (
                      <>
                        <Feature>
                          Structured Founder access
                        </Feature>
                        <Feature>
                          Founder messages
                        </Feature>
                        <Feature>
                          Founder calls
                        </Feature>
                        <Feature>
                          Proposal review
                        </Feature>
                        <Feature>
                          Strategy sessions
                        </Feature>
                        <Feature>
                          Priority Founder queue
                        </Feature>
                      </>
                    )}
                  </div>

                  <div className="mt-auto pt-8">
                    <button
                      type="button"
                      onClick={() => handleSubscribe(plan)}
                      disabled={isLoading}
                      className={`w-full rounded-2xl px-5 py-4 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isFounder
                          ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                          : isLodge
                            ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                            : "bg-white text-slate-950 hover:bg-slate-200"
                      }`}
                    >
                      {isLoading
                        ? "Connecting to Paystack..."
                        : "Subscribe"}
                    </button>

                    <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                      Monthly recurring membership.
                      Cancellation and subscription management
                      are subject to the applicable HnC and
                      Paystack terms.
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <section className="mx-auto mt-14 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-xl font-bold">
            Membership & Founder Access
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            HnC membership provides defined access based on the
            selected plan. Membership does not automatically
            guarantee Lodge approval, unlimited Founder access,
            investment opportunities, introductions, or
            transaction outcomes.
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            HnC may require verification, additional terms,
            eligibility checks, or approval for selected services
            and private-network features.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-5 text-sm">
          <Link
            href="/"
            className="text-slate-400 transition hover:text-white"
          >
            ← HnC Home
          </Link>

          <Link
            href="/ai"
            className="text-slate-400 transition hover:text-white"
          >
            Ask Ayo
          </Link>

          <Link
            href="/auth/login?redirect=/membership"
            className="text-slate-400 transition hover:text-white"
          >
            Log In
          </Link>

          <Link
            href="/auth/signup?product=membership"
            className="text-slate-400 transition hover:text-white"
          >
            Create Account
          </Link>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-5 text-slate-600">
          HnC membership fees are subscription charges for access
          to HnC services and features. They are not investments
          and do not represent a promise of financial return.
        </p>
      </div>
    </main>
  );
}

function Feature({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 text-sm text-slate-300">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-bold text-emerald-300">
        ✓
      </span>

      <span>{children}</span>
    </div>
  );
}