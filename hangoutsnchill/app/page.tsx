import Link from "next/link";

const services = [
  {
    number: "01",
    title: "AI-Powered Websites",
    description:
      "Modern websites enhanced with AI, smart content, customer experiences, forms, automation and business workflows.",
  },
  {
    number: "02",
    title: "Ecommerce Systems",
    description:
      "Online stores with products, customer accounts, checkout, payments, orders, digital delivery and administration.",
  },
  {
    number: "03",
    title: "Multi-Vendor Marketplaces",
    description:
      "Platforms that connect buyers and sellers with products, orders, payments, seller workflows and dashboards.",
  },
  {
    number: "04",
    title: "Digital Product Platforms",
    description:
      "Systems for selling ebooks, courses, templates, downloads and other digital products securely online.",
  },
  {
    number: "05",
    title: "Business Automation",
    description:
      "AI-assisted workflows, forms, customer processes, dashboards and automations designed to reduce repetitive work.",
  },
  {
    number: "06",
    title: "Custom Web Applications",
    description:
      "Purpose-built web applications with authentication, databases, dashboards, APIs and business-specific functionality.",
  },
];

const projects = [
  {
    tag: "FLAGSHIP PROJECT",
    title: "HangoutsNChill",
    description:
      "A digital business ecosystem combining marketplace, community, academy, creators, payments, digital products and business infrastructure.",
    features: [
      "Marketplace",
      "Payments",
      "Digital Products",
      "Community",
      "Academy",
      "HnC BUILD",
    ],
    href: "/",
  },
  {
    tag: "ENTERTAINMENT",
    title: "ÀTÚNBÍ Entertainment",
    description:
      "A digital entertainment platform combining personal branding, music, media, booking and audience engagement.",
    features: [
      "Entertainment",
      "Music",
      "Booking",
      "Media",
      "Personal Brand",
    ],
    href: "/",
  },
  {
    tag: "DIGITAL PRODUCT",
    title: "AI Business Launch Kit",
    description:
      "An AI-assisted digital product business concept built around product creation, ecommerce and secure digital delivery.",
    features: [
      "AI Products",
      "Ecommerce",
      "Digital Delivery",
      "Marketing",
    ],
    href: "/",
  },
];

const pricing = [
  {
    name: "STARTER",
    price: "$149+",
    title: "AI Business Website",
    description:
      "A professional website designed around your business, brand or personal project.",
  },
  {
    name: "BUSINESS",
    price: "$399+",
    title: "AI Ecommerce",
    description:
      "An ecommerce system with products, customer flows, checkout and payment integration.",
    featured: true,
  },
  {
    name: "ADVANCED",
    price: "$899+",
    title: "Digital Business System",
    description:
      "A custom platform combining ecommerce, databases, dashboards, AI and business workflows.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="group">
            <div className="text-xl font-black tracking-tight">
              THAT<span className="text-cyan-400">TALKING</span>GUY
            </div>
            <div className="text-[9px] font-medium tracking-[0.28em] text-slate-500">
              DIGITAL TECHNOLOGIES
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a
              href="#services"
              className="transition hover:text-cyan-400"
            >
              Services
            </a>
            <a
              href="#work"
              className="transition hover:text-cyan-400"
            >
              Work
            </a>
            <a
              href="#pricing"
              className="transition hover:text-cyan-400"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="transition hover:text-cyan-400"
            >
              About
            </a>
          </nav>

          <a
            href="#hire"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Hire Me
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-32 lg:pt-32">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              AI • Ecommerce • Digital Business Systems
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              I build
              <span className="text-cyan-400"> digital businesses,</span>{" "}
              not just websites.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              I turn business ideas into AI-powered websites, ecommerce
              platforms, marketplaces and digital systems designed for real
              customers and real-world growth.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#hire"
                className="rounded-full bg-cyan-400 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Hire Me on Fiverr →
              </a>

              <a
                href="#work"
                className="rounded-full border border-white/15 px-7 py-4 text-center font-bold text-white transition hover:border-cyan-400/50 hover:bg-white/5"
              >
                Explore My Work
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span>AI</span>
              <span>Next.js</span>
              <span>Supabase</span>
              <span>Ecommerce</span>
              <span>Payments</span>
              <span>Automation</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-8 rounded-[3rem] bg-cyan-400/10 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Digital System
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      Idea → Business
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-sm font-black text-slate-950">
                    AI
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    ["01", "Business Idea"],
                    ["02", "AI + Strategy"],
                    ["03", "Website / Platform"],
                    ["04", "Payments + Customers"],
                    ["05", "Automation + Growth"],
                  ].map(([number, text]) => (
                    <div
                      key={number}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                    >
                      <span className="text-xs font-bold text-cyan-400">
                        {number}
                      </span>
                      <span className="font-medium text-slate-200">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-cyan-400 p-5 text-slate-950">
                  <div className="text-xs font-bold uppercase tracking-[0.18em]">
                    The goal
                  </div>
                  <div className="mt-2 text-xl font-black">
                    Turn the idea into something people can actually use.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="border-y border-white/10 bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              What I Build
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Technology built around the business.
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              From a simple business website to a complex digital platform,
              I help structure the technology around how customers discover,
              interact, buy, book and return.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.number}
                className="bg-slate-950 p-7 transition hover:bg-slate-900"
              >
                <div className="text-sm font-bold text-cyan-400">
                  {service.number}
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Selected Work
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Real projects. Real systems.
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              My portfolio is built around practical digital products,
              platforms and business systems.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.title}
              className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
            >
              <div className="text-xs font-bold tracking-[0.2em] text-cyan-400">
                {project.tag}
              </div>

              <h3 className="mt-5 text-2xl font-black">
                {project.title}
              </h3>

              <p className="mt-4 flex-1 text-sm leading-7 text-slate-400">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <Link
                href={project.href}
                className="mt-7 text-sm font-bold text-white transition group-hover:text-cyan-400"
              >
                Explore project →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* HnC feature */}
      <section className="border-y border-white/10 bg-cyan-400 text-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.25em]">
              Flagship Technology Project
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              HangoutsNChill
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-800/80">
              A digital business ecosystem combining marketplace, community,
              academy, creators, payments, digital products and business
              infrastructure — with an expanding platform for building and
              running digital businesses.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full bg-slate-950 px-7 py-4 text-center font-bold text-white transition hover:bg-slate-800"
          >
            Explore HnC →
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="max-w-2xl">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Starting Prices
          </div>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Start simple. Build bigger.
          </h2>

          <p className="mt-5 leading-7 text-slate-400">
            Final pricing depends on functionality, integrations, content,
            design requirements and project complexity.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border p-7 ${
                plan.featured
                  ? "border-cyan-400/50 bg-cyan-400/[0.06]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="text-xs font-bold tracking-[0.2em] text-cyan-400">
                {plan.name}
              </div>

              <div className="mt-5 text-4xl font-black">
                {plan.price}
              </div>

              <h3 className="mt-4 text-xl font-bold">
                {plan.title}
              </h3>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-400">
                {plan.description}
              </p>

              <a
                href="#hire"
                className={`mt-7 block rounded-full px-5 py-3 text-center text-sm font-bold transition ${
                  plan.featured
                    ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                    : "border border-white/15 text-white hover:border-cyan-400/40"
                }`}
              >
                Discuss This Project
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-7">
          <div className="text-sm font-bold text-white">
            Custom Platforms
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Larger marketplaces, SaaS products, AI business systems and
            complex platforms are quoted individually. Typical custom
            projects can start around $1,000 and scale according to scope.
          </p>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-y border-white/10 bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                About
              </div>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Business thinking + technology + AI.
              </h2>
            </div>

            <div className="space-y-5 text-slate-400">
              <p className="leading-7">
                I help entrepreneurs, creators, startups and businesses turn
                ideas into practical digital products.
              </p>

              <p className="leading-7">
                My work combines AI, ecommerce, web development, payments,
                databases, automation, digital products and customer-facing
                business systems.
              </p>

              <p className="leading-7">
                I don't just build pages. I think about the complete journey:
                how a customer discovers a business, interacts with it,
                registers, buys, pays, receives value and comes back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hire CTA */}
      <section id="hire" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_55%)]" />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:px-8">
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Have an idea?
          </div>

          <h2 className="mt-5 text-5xl font-black tracking-[-0.04em] sm:text-6xl">
            Let's turn it into a working digital business.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Tell me what you want to build and let's figure out the right
            technology, structure and next steps.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://www.fiverr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Hire Me on Fiverr →
            </a>

            <a
              href="#work"
              className="rounded-full border border-white/15 px-8 py-4 font-bold text-white transition hover:border-cyan-400/50 hover:bg-white/5"
            >
              View My Work
            </a>
          </div>

          <p className="mt-5 text-xs text-slate-600">
            Fiverr is used for client communication and project transactions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="font-bold text-white">
              THAT<span className="text-cyan-400">TALKING</span>GUY
            </div>
            <div className="mt-1">
              AI • Ecommerce • Digital Business Systems
            </div>
          </div>

          <div className="text-left md:text-right">
            <div>© {new Date().getFullYear()} ThatTalkingGuy Digital Technologies</div>
            <div className="mt-1">
              Built around ideas that deserve to become businesses.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}