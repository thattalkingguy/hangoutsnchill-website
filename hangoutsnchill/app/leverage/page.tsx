"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

type Asset = {
  id: string;
  title: string;
  description: string;
  asset_category: string;
  country: string;
  state_region: string | null;
  city: string | null;
  asking_price: number | null;
  currency: string;
  status: string;
  verification_status: string;
  created_at: string;
};

const categories = [
  "All",
  "Real Estate",
  "Business",
  "Equipment",
  "Agriculture",
  "Energy",
  "Project",
  "Other",
];

export default function LeveragePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("leverage_assets")
      .select(
        `
          id,
          title,
          description,
          asset_category,
          country,
          state_region,
          city,
          asking_price,
          currency,
          status,
          verification_status,
          created_at
        `
      )
      .in("status", ["verified", "active"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMessage(
        "Unable to load available assets right now."
      );
      setAssets([]);
      setLoading(false);
      return;
    }

    setAssets((data as Asset[]) || []);
    setLoading(false);
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory =
      category === "All" ||
      asset.asset_category.toLowerCase() ===
        category.toLowerCase();

    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      asset.title.toLowerCase().includes(searchText) ||
      asset.description.toLowerCase().includes(searchText) ||
      asset.country.toLowerCase().includes(searchText) ||
      (asset.city ?? "")
        .toLowerCase()
        .includes(searchText);

    return matchesCategory && matchesSearch;
  });

  function formatPrice(
    amount: number | null,
    currency: string
  ) {
    if (amount === null) {
      return "Price on request";
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gray-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium">
              HnC LEVERAGE
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Acquire assets.
              <br />
              Structure the deal.
              <br />
              Complete it on HnC.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
              A transaction marketplace connecting buyers,
              sellers and professional deal participants
              around asset acquisitions worldwide.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/leverage/list"
                className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-gray-950 hover:bg-gray-200"
              >
                List an Asset
              </Link>

              <Link
                href="/leverage/request"
                className="rounded-lg border border-white/30 px-6 py-3 text-center font-semibold text-white hover:bg-white/10"
              >
                Find an Asset
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b bg-white px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          {[
            {
              number: "01",
              title: "Find",
              text: "Discover an asset or acquisition opportunity.",
            },
            {
              number: "02",
              title: "Structure",
              text: "Create and negotiate the transaction.",
            },
            {
              number: "03",
              title: "Verify",
              text: "Coordinate due diligence and professional services.",
            },
            {
              number: "04",
              title: "Complete",
              text: "Track the transaction through closing.",
            },
          ].map((step) => (
            <div key={step.number}>
              <p className="text-sm font-bold text-blue-600">
                {step.number}
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {step.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                Asset Marketplace
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Available opportunities
              </h2>

              <p className="mt-2 text-gray-500">
                Explore verified and active acquisition
                opportunities on HnC.
              </p>
            </div>

            <Link
              href="/leverage/list"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              + List Asset
            </Link>
          </div>

          {/* SEARCH */}
          <div className="mt-8 rounded-xl bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-semibold">
              Search assets
            </label>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search property, business, equipment, country..."
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    category === item
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* ERROR */}
          {errorMessage && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {errorMessage}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">
                Loading available assets...
              </p>
            </div>
          ) : filteredAssets.length === 0 ? (
            /* EMPTY */
            <div className="mt-8 rounded-xl bg-white p-12 text-center shadow-sm">
              <div className="text-4xl">🌍</div>

              <h3 className="mt-4 text-2xl font-bold">
                No assets available yet
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-gray-500">
                Be among the first to list an acquisition
                opportunity on HnC Leverage.
              </p>

              <Link
                href="/leverage/list"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                List Your Asset
              </Link>
            </div>
          ) : (
            /* ASSET GRID */
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssets.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/leverage/${asset.id}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-40 items-center justify-center bg-gray-900 text-5xl">
                    {asset.asset_category
                      .toLowerCase()
                      .includes("real")
                      ? "🏠"
                      : asset.asset_category
                          .toLowerCase()
                          .includes("business")
                      ? "🏢"
                      : asset.asset_category
                          .toLowerCase()
                          .includes("equipment")
                      ? "⚙️"
                      : asset.asset_category
                          .toLowerCase()
                          .includes("agri")
                      ? "🌾"
                      : asset.asset_category
                          .toLowerCase()
                          .includes("energy")
                      ? "⚡"
                      : "🌍"}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {asset.asset_category}
                      </span>

                      {asset.verification_status ===
                        "verified" && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-xl font-bold group-hover:text-blue-600">
                      {asset.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                      {asset.description}
                    </p>

                    <div className="mt-5 border-t pt-4">
                      <p className="text-lg font-bold">
                        {formatPrice(
                          asset.asking_price,
                          asset.currency
                        )}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {[
                          asset.city,
                          asset.state_region,
                          asset.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>

                    <div className="mt-5 font-semibold text-blue-600">
                      View Opportunity →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Have an asset to sell or acquire?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            HnC provides the transaction workspace for
            buyers and sellers to move from opportunity
            to completion.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/leverage/list"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              List an Asset
            </Link>

            <Link
              href="/leverage/request"
              className="rounded-lg border border-white/40 px-6 py-3 font-semibold hover:bg-blue-700"
            >
              Start an Acquisition
            </Link>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="bg-gray-100 px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-xs leading-5 text-gray-500">
          HnC Leverage is a technology and transaction
          coordination platform. Asset listings,
          valuations, financing, legal services, title
          verification, insurance and other regulated
          services may require independent verification
          and appropriately licensed professionals.
          Listing an asset or opportunity does not
          constitute an offer, guarantee of financing,
          investment recommendation or guarantee of
          transaction completion.
        </div>
      </section>
    </main>
  );
}