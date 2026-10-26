
"use client";

import { useMemo, useState } from "react";

type GiftCardVendor = {
  id: string;
  name: string;
  category: string;
  countries: string[];
  description: string;
  url: string;
  symbol: string;
  status: string;
  affiliatePartnerId?: string;
  trackingEnabled: boolean;
};

const vendors: GiftCardVendor[] = [
  {
    id: "amazon-gift-cards",
    name: "Amazon Gift Cards",
    category: "Shopping",
    countries: ["Global", "United States", "United Kingdom"],
    description:
      "Explore Amazon gift cards for eligible shopping, gifting and digital purchases. Check the destination country's terms before buying.",
    url: "https://www.amazon.com/gift-cards/",
    symbol: "📦",
    status: "Official website · Partnership not confirmed",
    trackingEnabled: false,
  },
  {
    id: "apple-gift-cards",
    name: "Apple Gift Cards",
    category: "Technology",
    countries: ["Global", "United States", "United Kingdom"],
    description:
      "Find official Apple gift card information for eligible Apple products, services and digital purchases. Availability varies by country.",
    url: "https://www.apple.com/shop/gift-cards",
    symbol: "🍎",
    status: "Official website · Partnership not confirmed",
    trackingEnabled: false,
  },
  {
    id: "google-play-gift-cards",
    name: "Google Play Gift Cards",
    category: "Gaming & Apps",
    countries: ["Global", "United States", "United Kingdom"],
    description:
      "Explore Google Play gift card information for eligible apps, games and digital content. Country and account restrictions apply.",
    url: "https://play.google.com/about/giftcards/",
    symbol: "▶️",
    status: "Official website · Partnership not confirmed",
    trackingEnabled: false,
  },
  {
    id: "steam-gift-cards",
    name: "Steam Gift Cards",
    category: "Gaming",
    countries: ["Global", "United States", "United Kingdom"],
    description:
      "Discover Steam digital gift cards and wallet options for eligible PC gaming purchases.",
    url: "https://store.steampowered.com/digitalgiftcards/",
    symbol: "🎮",
    status: "Official website · Partnership not confirmed",
    trackingEnabled: false,
  },
  {
    id: "playstation-gift-cards",
    name: "PlayStation Store Cards",
    category: "Gaming",
    countries: ["Global", "United States", "United Kingdom"],
    description:
      "Explore PlayStation Store gift card information. Make sure the card region matches the recipient's account region.",
    url: "https://www.playstation.com/",
    symbol: "🕹️",
    status: "Official website · Partnership not confirmed",
    trackingEnabled: false,
  },
  {
    id: "xbox-gift-cards",
    name: "Xbox Gift Cards",
    category: "Gaming",
    countries: ["Global", "United States", "United Kingdom"],
    description:
      "Explore Xbox gift cards and Microsoft digital purchase options. Check regional compatibility before purchasing.",
    url: "https://www.xbox.com/",
    symbol: "🎯",
    status: "Official website · Partnership not confirmed",
    trackingEnabled: false,
  },
  {
    id: "stanbic-ibtc-gift-cards",
    name: "Stanbic IBTC Digital Gifts",
    category: "Digital Vouchers",
    countries: ["Nigeria"],
    description:
      "Ayo is tracking official Stanbic IBTC gift and voucher options. Confirm the product and availability with the bank before making payment.",
    url: "https://www.stanbicibtcbank.com/",
    symbol: "🏦",
    status: "Nigeria · Product and partnership need verification",
    trackingEnabled: false,
  },
];

const categories = [
  "All categories",
  "Shopping",
  "Technology",
  "Gaming & Apps",
  "Gaming",
  "Digital Vouchers",
];

const countries = [
  "All countries",
  "Nigeria",
  "United States",
  "United Kingdom",
  "Global",
];

function getVendorHref(vendor: GiftCardVendor): string {
  if (vendor.trackingEnabled && vendor.affiliatePartnerId) {
    return `/api/affiliate/click?partner=${encodeURIComponent(
      vendor.affiliatePartnerId
    )}`;
  }

  return vendor.url;
}

export default function GiftCardsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [country, setCountry] = useState("All countries");

  const filteredVendors = useMemo(() => {
    const term = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !term ||
        vendor.name.toLowerCase().includes(term) ||
        vendor.category.toLowerCase().includes(term) ||
        vendor.description.toLowerCase().includes(term) ||
        vendor.countries.some((item) =>
          item.toLowerCase().includes(term)
        );

      const matchesCategory =
        category === "All categories" || vendor.category === category;

      const matchesCountry =
        country === "All countries" || vendor.countries.includes(country);

      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [search, category, country]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* PROMINENT GIFT CARD SCAM WARNING */}
      <section
        role="alert"
        aria-labelledby="gift-card-scam-warning"
        className="border-b-4 border-red-800 bg-red-50 px-5 py-6 text-red-950 sm:py-8"
      >
        <div className="mx-auto flex max-w-6xl items-start gap-3 sm:gap-5">
          <span
            className="text-3xl sm:text-4xl"
            aria-hidden="true"
          >
            ⚠️
          </span>

          <div className="min-w-0">
            <h2
              id="gift-card-scam-warning"
              className="text-xl font-black uppercase leading-tight tracking-wide sm:text-3xl"
            >
              Important Gift Card Scam Warning
            </h2>

            <p className="mt-4 text-base font-black leading-7 sm:text-lg">
              HnC has no official group/page for Gift Cards exchanges.
            </p>

            <p className="mt-3 font-bold leading-7">
              We will not be responsible for any loss or scam arising from
              unofficial gift card exchanges or dealings with third parties.
              Do not assume that anyone offering a gift card exchange through
              WhatsApp, Telegram, Facebook, social media or a private message
              represents HnC.
            </p>

            <p className="mt-3 font-semibold leading-7">
              Never send money to an unverified seller. Never disclose gift
              card PINs, redemption codes, passwords or sensitive banking
              details to strangers.
            </p>

            <p className="mt-4 border-t border-red-200 pt-3 font-black uppercase leading-6">
              Stay alert. Verify every seller independently. Never share
              your gift card codes.
            </p>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 px-5 py-14 text-white md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
            HangoutsNChill · HnC Earn
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Gift Cards, One Global Destination.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
            Discover gift card brands, explore official vendors and find
            options for shopping, gaming, apps and digital gifting. Ayo
            helps connect buyers with relevant sellers around the world.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#gift-card-directory"
              className="rounded-xl bg-white px-5 py-3 font-bold text-blue-900 transition hover:bg-blue-50"
            >
              Explore Gift Cards
            </a>

            <a
              href="mailto:hangoutsnchill@gmail.com?subject=HnC%20Gift%20Card%20Vendor%20Partnership"
              className="rounded-xl border border-white/40 px-5 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Become a Vendor
            </a>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: "🌍",
                title: "Global discovery",
                text: "Discover brands and regional options.",
              },
              {
                icon: "🤝",
                title: "Buyer–seller connections",
                text: "Help shoppers discover vendors.",
              },
              {
                icon: "💰",
                title: "HnC Earn",
                text: "Build revenue through approved partnerships.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/15 bg-white/10 p-4"
              >
                <p className="text-2xl font-black">{item.icon}</p>
                <p className="mt-2 font-bold">{item.title}</p>
                <p className="mt-1 text-sm text-blue-100">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GIFT CARD DIRECTORY */}
      <section
        id="gift-card-directory"
        className="mx-auto max-w-6xl px-5 py-12 md:py-16"
      >
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            Ayo Gift Card Scout
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Find your gift card
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Search the directory or filter by category and country.
            Availability and regional restrictions vary by vendor.
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Search vendors
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try Apple, gaming, Nigeria..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Category
            </span>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Country or region
            </span>

            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              {countries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            Showing <strong>{filteredVendors.length}</strong>{" "}
            {filteredVendors.length === 1 ? "vendor" : "vendors"}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("All categories");
              setCountry("All countries");
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-white"
          >
            Reset filters
          </button>
        </div>

        {filteredVendors.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <article
                key={vendor.id}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                    <span aria-hidden="true">{vendor.symbol}</span>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {vendor.category}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-extrabold">
                  {vendor.name}
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                  {vendor.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {vendor.countries.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  {vendor.status}
                </p>

                <a
                  href={getVendorHref(vendor)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-800"
                >
                  Visit official vendor{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <p className="text-3xl" aria-hidden="true">
              🔎
            </p>

            <h3 className="mt-3 text-xl font-bold">
              No matching vendors
            </h3>

            <p className="mt-2 text-slate-600">
              Try another search term, category or country.
            </p>
          </div>
        )}
      </section>

      {/* AYO GIFT CARD SCOUT */}
      <section className="border-y border-blue-100 bg-blue-50 px-5 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Meet Ayo
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Your Gift Card Scout
            </h2>

            <p className="mt-4 leading-7 text-slate-700">
              Ayo's goal is to help HnC discover gift card vendors across
              countries, identify legitimate seller programmes, and connect
              buyers with relevant options. Product availability and
              partnerships must be verified before being promoted.
            </p>

            <a
              href="mailto:hangoutsnchill@gmail.com?subject=Suggest%20a%20Gift%20Card%20Vendor"
              className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Suggest a vendor
            </a>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
            <h3 className="text-xl font-extrabold">
              Want to earn with HnC?
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Gift card sellers and authorized distributors can contact HnC
              about listings, referral tracking and commercial partnerships.
              HnC does not operate an official gift card exchange group or
              page.
            </p>

            <a
              href="mailto:hangoutsnchill@gmail.com?subject=HnC%20Gift%20Card%20Partnership"
              className="mt-5 inline-flex font-bold text-blue-700 hover:text-blue-900"
            >
              Discuss a partnership →
            </a>
          </div>
        </div>
      </section>

      {/* DISCLOSURES */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="text-lg font-extrabold">Important information</h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          HangoutsNChill is a discovery directory and does not claim to issue
          or sell the gift cards listed here. Vendor names and trademarks
          belong to their respective owners. HnC does not guarantee card
          availability, redemption, exchange rates or regional compatibility.
          Check official terms and verify sellers before paying. Never share
          a gift card PIN or redemption code with an untrusted person.
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          HnC has no official group/page for Gift Cards exchanges. HnC
          disclaims responsibility for losses or scams arising from
          unofficial third-party exchanges to the extent permitted by
          applicable law. This notice does not remove any legal
          responsibilities that cannot lawfully be excluded.
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          HnC may earn commissions through approved partnerships and qualifying
          tracked referrals. A listing or outbound link alone does not mean
          HnC earns a commission. No affiliation with Stanbic IBTC or any
          other listed brand is implied.
        </p>
      </section>
    </main>
  );
}
