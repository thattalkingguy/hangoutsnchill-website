"use client";

import { useState } from "react";

const ANDROID_LINK =
  "https://play.google.com/store/apps/details?id=com.invest.bamboo&referrer=hnc9oclock";

const IOS_LINK = "https://apps.apple.com/app/id1474833078";

const REFERRAL_CODE = "HNC9OCLOCK";

export default function InvestPage() {
  const [copied, setCopied] = useState(false);

  async function copyReferralCode() {
    try {
      await navigator.clipboard.writeText(REFERRAL_CODE);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              HnC Investment Hub
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Start your investment journey with HnC.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Explore investing in the U.S. and Nigerian stock markets and
              discover other investment opportunities available through
              Bamboo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                U.S. Stocks
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                Nigerian Stocks
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                Investment Education
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BAMBOO REFERRAL */}
      <section className="mx-auto max-w-6xl px-6 pb-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              HnC × Bamboo
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Join Bamboo and explore investing.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Use the HnC referral code when creating your Bamboo account.
              Bamboo provides access to investment products including U.S.
              and Nigerian stocks.
            </p>

            <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-sm text-slate-300">Your HnC referral code</p>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-xl bg-slate-950 px-4 py-3 font-mono text-lg font-bold tracking-wider text-emerald-300">
                  {REFERRAL_CODE}
                </div>

                <button
                  type="button"
                  onClick={copyReferralCode}
                  className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={ANDROID_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Get Bamboo — Android
              </a>

              <a
                href={IOS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-center font-semibold text-white transition hover:bg-white/15"
              >
                Get Bamboo — iPhone
              </a>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Learn before you invest.
            </h2>

            <div className="mt-7 space-y-6">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold">
                  1
                </div>

                <div>
                  <h3 className="font-semibold">Create your account</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Download Bamboo and use the HnC referral code during
                    registration.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold">
                  2
                </div>

                <div>
                  <h3 className="font-semibold">Fund your account</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Complete Bamboo&apos;s required verification and funding
                    process.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold">
                  3
                </div>

                <div>
                  <h3 className="font-semibold">Explore investments</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Research available investment products and make decisions
                    based on your own goals and risk tolerance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DANGOTE IPO */}
      <section className="border-y border-white/10 bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              HnC Investment Education
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Dangote Refinery IPO
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Learn about the current Dangote Petroleum Refinery public offer,
              understand the subscription process, and review the official
              information before making an investment decision.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-slate-400">Offer price</p>
              <p className="mt-2 text-3xl font-bold">₦525</p>
              <p className="mt-1 text-sm text-slate-500">per share</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-slate-400">Minimum</p>
              <p className="mt-2 text-3xl font-bold">10</p>
              <p className="mt-1 text-sm text-slate-500">shares</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-slate-400">Minimum value</p>
              <p className="mt-2 text-3xl font-bold">₦5,250</p>
              <p className="mt-1 text-sm text-slate-500">before applicable fees</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-slate-400">Offer closes</p>
              <p className="mt-2 text-3xl font-bold">13 Oct</p>
              <p className="mt-1 text-sm text-slate-500">2026</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-6">
            <h3 className="font-semibold text-amber-300">
              Important
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              The Dangote Refinery IPO is an investment opportunity, not a
              guaranteed return. Share prices can rise or fall, and
              subscription does not guarantee a particular investment outcome.
              Read the official offer documents and use approved subscription
              channels before investing.
            </p>

            <a
              href="https://ipo.dangote.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-semibold text-amber-300 underline underline-offset-4 hover:text-amber-200"
            >
              View official Dangote IPO information →
            </a>
          </div>
        </div>
      </section>

      {/* DISCLOSURE */}
      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
          <h2 className="text-xl font-bold">
            HnC Affiliate & Investment Disclosure
          </h2>

          <div className="mt-4 space-y-4 text-sm leading-6 text-slate-400">
            <p>
              HnC may receive a referral reward from Bamboo when eligible users
              register using the HnC referral code and meet Bamboo&apos;s
              referral-program requirements.
            </p>

            <p>
              The Bamboo referral relationship does not guarantee investment
              returns, profits, IPO allocation, or any particular financial
              outcome.
            </p>

            <p>
              Investment products involve risk. Always review the relevant
              terms, fees, prospectus, and regulatory information before
              investing. Make investment decisions based on your own
              circumstances and risk tolerance.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} HangoutsNChill. Learn. Connect. Grow.
      </footer>
    </main>
  );
}