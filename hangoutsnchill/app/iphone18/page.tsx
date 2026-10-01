import Link from "next/link";

const quickLinks = [
  { label: "🎁 Win an iPhone", href: "#giveaways" },
  { label: "📱 Shop iPhone", href: "#shop" },
  { label: "💰 Deals", href: "#deals" },
  { label: "🔄 Trade-In", href: "#trade" },
  { label: "🎧 Accessories", href: "#accessories" },
  { label: "🤝 Partners", href: "#partners" },
];

const campaignCards = [
  {
    badge: "GIVEAWAY",
    title: "Verified iPhone Giveaways",
    text: "HnC will collect legitimate public promotions, show their eligibility and closing dates, and clearly identify the organizer.",
    href: "#giveaways",
    cta: "See giveaways →",
  },
  {
    badge: "SHOP",
    title: "Find iPhone Deals",
    text: "Discover participating retailers and partner offers through HnC referral links and campaign pages.",
    href: "#shop",
    cta: "Explore offers →",
  },
  {
    badge: "TRADE",
    title: "Trade Your Old Phone",
    text: "Connect visitors with participating trade-in and device-buyback partners.",
    href: "#trade",
    cta: "Explore trade-ins →",
  },
  {
    badge: "ACCESSORIES",
    title: "Complete Your Setup",
    text: "Cases, chargers, AirPods, power banks, screen protection and other device accessories from participating partners.",
    href: "#accessories",
    cta: "Shop accessories →",
  },
];

const partnerTypes = [
  "Apple-authorized retailers",
  "Phone & electronics stores",
  "Trade-in & buyback businesses",
  "Banks & fintech companies",
  "Telecom operators",
  "Accessory brands",
  "Event sponsors",
  "Affiliate networks",
];

const partnerDirectory = [
  {
    name: "MTN eShop",
    category: "Affiliate Commerce",
    status: "Affiliate program available",
    badge: "💰 COMMISSION",
    description:
      "MTN eShop currently operates an affiliate program for creators, publishers, bloggers and organizations. Its official page says qualifying purchases can earn up to 10% commission.",
    opportunity:
      "HnC can pursue approval and use tracked product links for eligible devices, accessories and other MTN eShop products.",
    href: "https://uat-shop.mtn.ng/affiliate-marketing",
    cta: "View MTN Affiliate Program →",
    note: "HnC enrollment/approval is not being claimed here.",
  },
  {
    name: "RHMS Tech",
    category: "Apple Referral",
    status: "Refer & Earn available",
    badge: "🍎 APPLE",
    description:
      "RHMS Tech publishes a Refer & Earn program for customers buying, selling or swapping Apple devices.",
    opportunity:
      "RHMS publishes fixed referral rewards based on transaction value, creating a potential HnC route for Apple-device referrals and trade/swap leads.",
    href: "https://www.rhmstech.com/affiliate",
    cta: "View RHMS Referral Program →",
    note: "Commission terms are subject to RHMS rules and may change.",
  },
  {
    name: "Konga",
    category: "Affiliate Commerce",
    status: "Affiliate program available",
    badge: "🛒 AFFILIATE",
    description:
      "Konga operates an affiliate platform that allows affiliates to promote products using unique links and earn commissions on qualifying orders.",
    opportunity:
      "HnC can pursue affiliate approval and promote eligible phones, accessories and technology products.",
    href: "https://affiliate.konga.com/",
    cta: "Visit Konga Affiliates →",
    note: "Product-level commissions and eligibility should be confirmed inside the affiliate dashboard.",
  },
  {
    name: "iStore Nigeria",
    category: "Retail / Trade-In / Finance",
    status: "Partner target",
    badge: "🍏 RETAIL",
    description:
      "iStore identifies itself as an Apple Authorised Reseller and currently offers Apple devices together with trade-in and device-financing services.",
    opportunity:
      "HnC can approach iStore for a commercial partnership, sponsored campaign, event activation, referral arrangement or approved promotional placement.",
    href: "https://www.istore.com.ng/",
    cta: "Visit iStore Nigeria →",
    note: "HnC is not claiming an iStore affiliate relationship.",
  },
];

const commissionExamples = [
  ["RHMS", "₦100k–₦349k", "₦5,000"],
  ["RHMS", "₦350k–₦649k", "₦7,000"],
  ["RHMS", "₦650k–₦999k", "₦12,000"],
  ["RHMS", "₦1m–₦1.499m", "₦15,000"],
  ["RHMS", "₦1.5m–₦2m", "₦20,000"],
  ["RHMS", "Above ₦2m", "₦25,000"],
];

export default function IPhone18Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/" className="shrink-0">
            <div className="text-2xl font-black tracking-tight">
              <span className="text-white">H</span>
              <span className="text-emerald-400">n</span>
              <span className="text-white">C</span>
            </div>
            <div className="text-[8px] font-bold tracking-[0.22em] text-slate-500">
              HANGOUTSNCHILL
            </div>
          </Link>

          <Link
            href="/events"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-400"
          >
            HnC Events →
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              HnC Tech & Commerce
            </div>

            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              iPhone 18
              <span className="block text-emerald-400">Hub.</span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              Win. Shop. Compare. Trade. Accessorize. HnC brings iPhone-related
              campaigns, offers, events and partner opportunities into one
              discovery hub.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {quickLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <p className="mt-8 max-w-2xl text-xs leading-6 text-slate-500">
              HnC is an independent platform and is not presenting this page as
              an Apple-sponsored or Apple-endorsed campaign. Individual offers
              remain subject to each organizer&apos;s terms, eligibility and
              availability.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {campaignCards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.05]"
            >
              <div className="text-[10px] font-black tracking-[0.2em] text-emerald-400">
                {card.badge}
              </div>

              <h2 className="mt-4 text-xl font-black">{card.title}</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {card.text}
              </p>

              <div className="mt-6 text-sm font-bold text-white group-hover:text-emerald-400">
                {card.cta}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section
        id="giveaways"
        className="scroll-mt-24 border-y border-white/10 bg-white/[0.025]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              🎁 Giveaway Desk
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Find iPhone campaigns without the guesswork.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              HnC will organize public giveaway campaigns by organizer,
              eligibility, closing date, prize and entry requirements. We will
              not describe an independent promotion as an Apple giveaway
              unless the organizer and documentation support that description.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-7">
              <div className="text-3xl">🛡️</div>

              <h3 className="mt-4 text-xl font-black">HnC Verified</h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Organizer, official destination, published rules, eligibility
                and important dates checked before HnC gives the campaign a
                verification badge.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
              <div className="text-3xl">⚠️</div>

              <h3 className="mt-4 text-xl font-black">Safety first</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                HnC will never ask users to submit their card PIN, OTP or
                banking password to enter a giveaway. Suspicious campaigns are
                excluded or clearly marked as external and unverified.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-7">
            <div className="text-sm font-bold text-slate-300">
              Campaign directory
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Verified campaign cards will appear here as HnC completes partner
              and eligibility checks.
            </p>
          </div>
        </div>
      </section>

      <section
        id="shop"
        className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              📱 Shop
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Turn discovery into commerce.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              HnC can connect visitors to participating retailers, affiliate
              programs and campaign-specific offers. Each commercial partner
              can receive a dedicated tracked destination rather than a random
              banner placement.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
                Tracked referrals
              </span>

              <span className="rounded-full bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
                Partner offers
              </span>

              <span className="rounded-full bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
                Campaign analytics
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              HnC Commerce Flow
            </div>

            <div className="mt-6 space-y-4">
              {[
                ["01", "Visitor discovers an offer"],
                ["02", "HnC records the campaign click"],
                ["03", "Visitor reaches the partner"],
                ["04", "Partner handles the purchase"],
                ["05", "Eligible commission is attributed"],
              ].map(([number, text]) => (
                <div key={number} className="flex gap-4">
                  <span className="text-sm font-black text-emerald-400">
                    {number}
                  </span>

                  <span className="text-sm text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="deals"
        className="scroll-mt-24 border-y border-white/10 bg-emerald-400 text-slate-950"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em]">
              💰 Deals & Promotions
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              One place for launch-period offers.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-900/75">
              Retail discounts, bundles, financing, trade-in campaigns and
              accessory promotions can each have their own HnC campaign card
              and tracking destination.
            </p>
          </div>
        </div>
      </section>

      <section
        id="trade"
        className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              🔄 Trade-In
            </div>

            <h2 className="mt-3 text-3xl font-black">
              Your old phone can become part of the journey.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              HnC can connect users with participating trade-in and device
              buyback services, while keeping each provider&apos;s valuation,
              terms and eligibility clearly separated.
            </p>
          </div>
        </div>
      </section>

      <section
        id="accessories"
        className="scroll-mt-24 border-y border-white/10 bg-white/[0.025]"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              🎧 Accessories
            </div>

            <h2 className="mt-3 text-3xl font-black">
              More products. More partner opportunities.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Cases, screen protection, charging gear, audio products, power
              banks and creator accessories give HnC additional categories for
              affiliate commerce.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Cases", "Charging", "Audio", "Creator Gear"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5 text-center font-bold text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="partners"
        className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-8 sm:p-10">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              🤝 HnC Partner Network
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Bring your iPhone campaign to HnC.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Retailers, brands, fintechs, telcos, event sponsors and affiliate
              networks can work with HnC on measurable campaigns, sponsored
              placements, giveaways, event activations and referral commerce.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {partnerTypes.map((type) => (
              <div
                key={type}
                className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm font-semibold text-slate-200"
              >
                {type}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-200"
            >
              Talk to HnC →
            </Link>

            <Link
              href="/earn"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-black text-white transition hover:border-white/30"
            >
              HnC Earn →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="partner-directory"
        className="border-y border-white/10 bg-slate-900/70"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              🔗 HnC Partner Directory
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Real partner opportunities. Clearly labeled.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              This directory separates existing public affiliate/referral
              programs from businesses HnC may approach for a direct
              partnership. HnC does not claim approval or commercial
              relationships that have not been established.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {partnerDirectory.map((partner) => (
              <article
                key={partner.name}
                className="rounded-3xl border border-white/10 bg-slate-950 p-7 transition hover:border-emerald-400/25"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-black tracking-[0.16em] text-emerald-300">
                    {partner.badge}
                  </span>

                  <span className="text-xs font-semibold text-slate-500">
                    {partner.category}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black">{partner.name}</h3>

                <div className="mt-2 text-sm font-bold text-emerald-400">
                  {partner.status}
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300">
                  {partner.description}
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    HnC opportunity
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {partner.opportunity}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-xs leading-6 text-slate-500">
                  ⚠️ {partner.note}
                </div>

                <a
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                >
                  {partner.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              💵 Published Referral Examples
            </div>

            <h2 className="mt-3 text-3xl font-black">
              Where public commission terms exist, HnC can show them clearly.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              The examples below are published by RHMS Tech on its official
              referral page. They are not HnC earnings guarantees and are not
              presented as current HnC revenue.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              <span>Partner</span>
              <span>Order value</span>
              <span>Published reward</span>
            </div>

            {commissionExamples.map(([partner, range, reward]) => (
              <div
                key={`${range}-${reward}`}
                className="grid grid-cols-3 border-b border-white/5 px-5 py-4 text-sm"
              >
                <span className="font-bold text-slate-300">{partner}</span>
                <span className="text-slate-400">{range}</span>
                <span className="font-black text-emerald-400">{reward}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xl font-black">HnC iPhone 18 Hub</div>

              <div className="mt-1 text-xs text-slate-500">
                WIN • SHOP • COMPARE • TRADE • ACCESSORIZE
              </div>
            </div>

            <Link
              href="/"
              className="text-sm font-bold text-emerald-400 hover:text-emerald-300"
            >
              Back to HnC →
            </Link>
          </div>

          <p className="mt-8 max-w-4xl text-xs leading-6 text-slate-600">
            Affiliate disclosure: HnC may receive a commission or other
            commercial benefit when a visitor completes an eligible action
            through a participating partner link. Partner terms, pricing,
            inventory, eligibility and campaign rules can change. HnC does not
            guarantee any prize, discount, approval, delivery time or
            commission.
          </p>
        </div>
      </section>
    </main>
  );
}