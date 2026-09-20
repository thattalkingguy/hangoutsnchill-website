"use client";

import Link from "next/link";

export default function DevelopmentLanding() {
  return (
    <main className="min-h-screen bg-[#F7F1E3] text-[#17130F]">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(184,149,74,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(23,19,15,0.08),_transparent_35%)]" />

        <div className="relative z-10 w-full max-w-6xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-[#B8954A]/40 bg-white/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#8A6A24] shadow-sm">
            HnC Platform Development
          </div>

          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            Hangouts<span className="text-[#B8954A]">N</span>Chill
          </h1>

          <p className="mt-4 text-xl font-semibold tracking-wide text-[#62574B] sm:text-2xl">
            Learn. Connect. Earn.
          </p>

          <div className="mx-auto mt-10 max-w-3xl">
            <h2 className="text-3xl font-black sm:text-5xl">
              Your identity. Your website. Your HnC.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#62574B] sm:text-lg">
              HnC is being built as more than a marketplace. Every person,
              creator, professional and business will be able to establish
              their own digital presence inside the HnC ecosystem.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "HnC ID",
                text: "Your identity across the ecosystem.",
              },
              {
                title: "HnC SITE",
                text: "Create your own working website.",
              },
              {
                title: "HnC STORE",
                text: "Sell products and digital services.",
              },
              {
                title: "HnC TOOLS",
                text: "Use AI, bookings, forms, payments and more.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#B8954A]/20 bg-white/80 p-6 text-left shadow-sm"
              >
                <div className="text-lg font-black">{item.title}</div>

                <p className="mt-2 text-sm leading-6 text-[#62574B]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-[#B8954A]/30 bg-[#17130F] p-8 text-left text-[#F7F1E3] shadow-xl sm:p-10">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8B45A]">
              The next layer of HnC
            </div>

            <h3 className="mt-3 text-3xl font-black sm:text-4xl">
              BUILD your digital world on HnC.
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#D8CEC0] sm:text-base">
              Tell HnC what you want to build. HnC will help you create the
              pages, content, store, booking system, forms and other tools
              needed to operate your digital presence.
            </p>

            <div className="mt-7">
              <Link
                href="/build"
                className="inline-flex rounded-xl bg-[#D8B45A] px-7 py-4 text-sm font-black text-[#17130F] shadow-lg transition hover:-translate-y-0.5"
              >
                Start Building
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#62574B]">
                Platform Development
              </span>

              <span className="text-3xl font-black text-[#B8954A]">
                80%
              </span>
            </div>

            <div className="mt-3 h-4 overflow-hidden rounded-full border border-[#B8954A]/30 bg-white">
              <div className="h-full w-[80%] rounded-full bg-[#B8954A]" />
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-5">
            {[
              "Discover",
              "Learn",
              "Connect",
              "Buy",
              "Earn",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-[#B8954A]/20 bg-white/75 px-4 py-5 shadow-sm"
              >
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#17130F] text-sm font-bold text-[#D8B45A]">
                  {index + 1}
                </div>

                <div className="text-sm font-bold">{item}</div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <h2 className="text-2xl font-black sm:text-3xl">
              One platform. Multiple opportunities.
            </h2>

            <p className="mt-4 text-base leading-7 text-[#62574B]">
              Marketplace, learning, community, creators, websites,
              businesses, bookings, digital products, earning opportunities
              and more — connected through one HnC ecosystem.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/build"
              className="rounded-xl bg-[#17130F] px-7 py-4 text-sm font-bold text-[#F7F1E3] shadow-lg transition hover:-translate-y-0.5"
            >
              BUILD on HnC
            </Link>

            <span className="rounded-xl border border-[#B8954A]/30 bg-white/60 px-7 py-4 text-sm font-semibold text-[#62574B]">
              Official Launch — Coming Soon
            </span>
          </div>

          <p className="mt-10 text-xs text-[#8A7B6B]">
            © 2026 HangoutsNChill. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}