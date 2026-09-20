import Link from "next/link";

const pillars = [
  {
    title: "Marketplace",
    description:
      "Discover products, digital products, services and opportunities from creators and businesses.",
    href: "/marketplace",
    label: "Shop & Discover",
  },
  {
    title: "Academy",
    description:
      "Learn practical skills, business ideas, digital tools and knowledge that can help you grow.",
    href: "/academy",
    label: "Learn",
  },
  {
    title: "Community",
    description:
      "Connect with people, ideas, creators, entrepreneurs and opportunities.",
    href: "/community",
    label: "Connect",
  },
  {
    title: "Creators",
    description:
      "Discover creators, talent and people building exciting things across the HnC ecosystem.",
    href: "/creators",
    label: "Discover",
  },
  {
    title: "Earn",
    description:
      "Explore affiliate opportunities, digital products and practical ways to build additional income streams.",
    href: "/earn",
    label: "Earn",
  },
  {
    title: "Invest",
    description:
      "Learn about investment opportunities, financial education and available investment platforms.",
    href: "/invest",
    label: "Explore Investments",
  },
];

const features = [
  "Marketplace",
  "Academy",
  "Community",
  "Creators",
  "Earn",
  "Invest",
  "Digital Products",
  "Business Opportunities",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="group">
            <div className="text-2xl font-black tracking-tight">
              <span className="text-white">H</span>
              <span className="text-emerald-400">n</span>
              <span className="text-white">C</span>
            </div>

            <div className="text-[9px] font-bold tracking-[0.22em] text-slate-400">
              HANGOUTSNCHILL
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 lg:flex">
            <Link
              href="/marketplace"
              className="transition hover:text-emerald-400"
            >
              Marketplace
            </Link>

            <Link
              href="/academy"
              className="transition hover:text-emerald-400"
            >
              Academy
            </Link>

            <Link
              href="/community"
              className="transition hover:text-emerald-400"
            >
              Community
            </Link>

            <Link
              href="/creators"
              className="transition hover:text-emerald-400"
            >
              Creators
            </Link>

            <Link href="/earn" className="transition hover:text-emerald-400">
              Earn
            </Link>

            <Link
              href="/invest"
              className="transition hover:text-emerald-400"
            >
              Invest
            </Link>
          </nav>

          <Link
            href="/services/e-affidavit"
            className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            Get E-Affidavit
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="max-w-5xl">
            <div className="mb-7 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              People • Ideas • Opportunities
            </div>

            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Welcome to
              <span className="block text-emerald-400">
                HangoutsNChill.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              A digital ecosystem where people connect, learn, create,
              discover products, explore opportunities and build businesses.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/community"
                className="rounded-full bg-emerald-400 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                Join the Community →
              </Link>

              <Link
                href="/marketplace"
                className="rounded-full border border-white/15 px-7 py-4 text-center font-bold text-white transition hover:border-emerald-400/50 hover:bg-white/5"
              >
                Explore Marketplace
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
              {features.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* E-AFFIDAVIT PUBLIC SERVICE */}
      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <Link
            href="/services/e-affidavit"
            className="group block overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-emerald-400/10 to-white/[0.03] p-7 transition hover:border-emerald-400/50 hover:bg-emerald-400/15 md:p-9"
          >
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🏛️</span>

                  <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                    HnC Public Service
                  </span>
                </div>

                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  Need an E-Affidavit?
                </h2>

                <p className="mt-3 text-lg leading-8 text-slate-300">
                  Get started through HnC and access the official Federal
                  High Court e-Affidavit service. No HnC membership required.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">
                    HnC service fee: ₦0
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300">
                    Government/court charges apply separately
                  </span>
                </div>
              </div>

              <div className="shrink-0 rounded-full bg-emerald-400 px-7 py-4 text-center font-bold text-slate-950 transition group-hover:bg-emerald-300">
                Get Started →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* CONNECT / BUY / GROW */}
      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950 p-8">
              <div className="text-4xl">🤝</div>

              <h2 className="mt-6 text-2xl font-black">Connect</h2>

              <p className="mt-3 leading-7 text-slate-400">
                Meet people, creators, entrepreneurs and communities around
                ideas and opportunities.
              </p>

              <Link
                href="/community"
                className="mt-6 inline-block font-bold text-emerald-400"
              >
                Explore Community →
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950 p-8">
              <div className="text-4xl">🛍️</div>

              <h2 className="mt-6 text-2xl font-black">Buy & Discover</h2>

              <p className="mt-3 leading-7 text-slate-400">
                Discover products, digital products, services and businesses
                inside the HnC ecosystem.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-block font-bold text-emerald-400"
              >
                Visit Marketplace →
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950 p-8">
              <div className="text-4xl">🚀</div>

              <h2 className="mt-6 text-2xl font-black">Learn & Grow</h2>

              <p className="mt-3 leading-7 text-slate-400">
                Build skills, discover opportunities and turn ideas into
                something bigger.
              </p>

              <Link
                href="/academy"
                className="mt-6 inline-block font-bold text-emerald-400"
              >
                Enter Academy →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HNC PILLARS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            The HnC Ecosystem
          </div>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            More than entertainment.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            HnC brings people, ideas, commerce, education and opportunities
            together in one growing digital ecosystem.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.05]"
            >
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                {pillar.label}
              </div>

              <h3 className="mt-5 text-2xl font-black">{pillar.title}</h3>

              <p className="mt-4 leading-7 text-slate-400">
                {pillar.description}
              </p>

              <div className="mt-7 font-bold text-white transition group-hover:text-emerald-400">
                Explore {pillar.title} →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* INVESTMENT FEATURE */}
      <section className="border-y border-white/10 bg-emerald-400 text-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.25em]">
              HnC Investment Hub
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Learn. Understand. Grow.
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-900/75">
              Explore investment education, current opportunities and
              financial platforms available through HnC.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold">
              <span className="rounded-full bg-slate-950 px-4 py-2 text-white">
                Nigerian Markets
              </span>

              <span className="rounded-full bg-slate-950 px-4 py-2 text-white">
                U.S. Markets
              </span>

              <span className="rounded-full bg-slate-950 px-4 py-2 text-white">
                Financial Education
              </span>
            </div>
          </div>

          <Link
            href="/invest"
            className="rounded-full bg-slate-950 px-8 py-4 text-center font-bold text-white transition hover:bg-slate-800"
          >
            Visit Investment Hub →
          </Link>
        </div>
      </section>

      {/* CREATOR / BUSINESS CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_55%)]" />

        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-8">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            Your idea belongs here
          </div>

          <h2 className="mt-5 text-5xl font-black tracking-[-0.04em] sm:text-6xl">
            Connect. Create. Build. Grow.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Whether you're a creator, entrepreneur, business owner, learner
            or someone with an idea, HnC is built to help you find your next
            opportunity.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/creators"
              className="rounded-full bg-emerald-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Discover Creators →
            </Link>

            <Link
              href="/community"
              className="rounded-full border border-white/15 px-8 py-4 font-bold text-white transition hover:border-emerald-400/50 hover:bg-white/5"
            >
              Join HnC →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <div className="text-2xl font-black">
                <span className="text-white">H</span>
                <span className="text-emerald-400">n</span>
                <span className="text-white">C</span>
              </div>

              <div className="mt-1 text-xs font-bold tracking-[0.2em] text-slate-500">
                HANGOUTSNCHILL
              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                People • Ideas • Opportunities
              </p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <Link href="/marketplace" className="hover:text-emerald-400">
                Marketplace
              </Link>

              <Link href="/academy" className="hover:text-emerald-400">
                Academy
              </Link>

              <Link href="/community" className="hover:text-emerald-400">
                Community
              </Link>

              <Link href="/creators" className="hover:text-emerald-400">
                Creators
              </Link>

              <Link href="/earn" className="hover:text-emerald-400">
                Earn
              </Link>

              <Link href="/invest" className="hover:text-emerald-400">
                Invest
              </Link>

              <Link
                href="/services/e-affidavit"
                className="hover:text-emerald-400"
              >
                E-Affidavit
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-sm text-slate-600">
            © {new Date().getFullYear()} HangoutsNChill. All rights reserved.
          </div>
        </div>
      </footer>
        {/* E-AFFIDAVIT PUBLIC SERVICE */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 md:p-12">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">
                HnC Public Service
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Need an E-Affidavit?
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Get started with the official Federal High Court e-Affidavit
                service. No HnC membership is required.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  HnC service fee: ₦0
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  Government/court charges apply separately
                </span>
              </div>

              <div className="mt-8">
                <Link
                  href="/services/e-affidavit"
                  className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  Get E-Affidavit →
                </Link>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}