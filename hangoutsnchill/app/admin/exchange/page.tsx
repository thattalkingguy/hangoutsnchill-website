"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ExchangeOrder = {
  id: string;
  userId: string;

  customer: {
    fullName: string;
    username: string | null;
    verified: boolean;
  };

  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  fee: number;
  status: string;
  provider: string | null;
  providerReference: string | null;
  quoteId: string | null;
  quoteExpiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
};

type AssetTotal = {
  asset: string;
  amount: number;
};

type ExchangeData = {
  summary: {
    total: number;
    pending: number;
    completed: number;
    failed: number;
    cancelled: number;
    expired: number;
  };

  volumeByAsset: AssetTotal[];

  feesByAsset: AssetTotal[];

  orders: ExchangeOrder[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: ExchangeData;
  summary?: ExchangeData["summary"];
  volumeByAsset?: AssetTotal[];
  feesByAsset?: AssetTotal[];
  orders?: ExchangeOrder[];
  admin?: {
    fullName: string | null;
    role: string;
    verified: boolean;
  };
};

function formatAmount(
  amount: number,
  asset: string
) {
  const fiatAssets = [
    "NGN",
    "USD",
    "EUR",
    "GBP",
  ];

  return amount.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits:
      fiatAssets.includes(asset)
        ? 2
        : 8,
  });
}

function formatRate(
  rate: number
) {
  if (!Number.isFinite(rate)) {
    return "—";
  }

  return rate.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits: 8,
    }
  );
}

function formatDate(
  date: string | null
) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function statusClass(
  status: string
) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";

    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-700";

    case "failed":
    case "cancelled":
      return "bg-red-100 text-red-700";

    case "expired":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function statusLabel(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

export default function AdminExchangePage() {
  const [data, setData] =
    useState<ExchangeData | null>(
      null
    );

  const [adminName, setAdminName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [assetFilter, setAssetFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadExchangeData();
  }, []);

  async function loadExchangeData() {
    try {
      if (!data) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          "Unable to verify your session."
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "Please log in to access HnC Admin."
        );
      }

      const response = await fetch(
        "/api/admin/exchange",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${session.access_token}`,

            Accept: "application/json",
          },

          cache: "no-store",
        }
      );

      const result: ApiResponse =
        await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.summary
      ) {
        throw new Error(
          result.message ||
            "Unable to load exchange records."
        );
      }

      setAdminName(
        result.admin?.fullName ||
          "HnC Administrator"
      );

      setData({
        summary: result.summary,

        volumeByAsset:
          result.volumeByAsset ||
          [],

        feesByAsset:
          result.feesByAsset ||
          [],

        orders:
          result.orders ||
          [],
      });
    } catch (error) {
      console.error(
        "Admin exchange page error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load exchange records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const availableAssets =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const assets = new Set<string>();

      for (const order of data.orders) {
        assets.add(
          order.fromAsset
        );

        assets.add(
          order.toAsset
        );
      }

      return Array.from(assets).sort();
    }, [data]);

  const filteredOrders =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const searchTerm =
        search.trim().toLowerCase();

      return data.orders.filter(
        (order) => {
          const matchesStatus =
            statusFilter === "all" ||
            order.status ===
              statusFilter;

          const matchesAsset =
            assetFilter === "all" ||
            order.fromAsset ===
              assetFilter ||
            order.toAsset ===
              assetFilter;

          const matchesSearch =
            !searchTerm ||
            order.customer.fullName
              .toLowerCase()
              .includes(searchTerm) ||
            (
              order.customer
                .username || ""
            )
              .toLowerCase()
              .includes(searchTerm) ||
            order.fromAsset
              .toLowerCase()
              .includes(searchTerm) ||
            order.toAsset
              .toLowerCase()
              .includes(searchTerm) ||
            order.id
              .toLowerCase()
              .includes(searchTerm) ||
            (
              order.quoteId || ""
            )
              .toLowerCase()
              .includes(searchTerm);

          return (
            matchesStatus &&
            matchesAsset &&
            matchesSearch
          );
        }
      );
    }, [
      data,
      statusFilter,
      assetFilter,
      search,
    ]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading HnC Exchange Management...
        </p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="text-4xl">
            🔒
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Exchange Management
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadExchangeData
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="rounded-3xl bg-gray-900 p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/admin"
                  className="text-sm font-semibold text-gray-400 hover:text-white"
                >
                  ← Admin Dashboard
                </Link>

                <span className="text-gray-600">
                  /
                </span>

                <span className="text-sm font-semibold text-blue-400">
                  Exchange
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-bold">
                Exchange Management
              </h1>

              <p className="mt-3 text-gray-300">
                Monitor HnC exchange activity,
                volumes, fees and transaction
                status.
              </p>

              <p className="mt-3 text-sm text-gray-400">
                Administrator:{" "}
                <span className="font-semibold text-white">
                  {adminName}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadExchangeData
              }
              disabled={refreshing}
              className="rounded-xl bg-white px-5 py-3 font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-60"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.summary.total}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {data.summary.completed}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {data.summary.pending}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Failed
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {data.summary.failed}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Cancelled
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-700">
                {data.summary.cancelled}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Expired
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-500">
                {data.summary.expired}
              </p>
            </div>

          </div>
        </section>

        {/* VOLUME AND FEES */}

        <section className="mt-10 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Completed Volume
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Total source-asset volume from
              completed exchanges.
            </p>

            <div className="mt-5 space-y-3">
              {data.volumeByAsset.map(
                (item) => (
                  <div
                    key={item.asset}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <span className="font-semibold text-gray-700">
                      {item.asset}
                    </span>

                    <span className="font-bold text-gray-900">
                      {formatAmount(
                        item.amount,
                        item.asset
                      )}{" "}
                      {item.asset}
                    </span>
                  </div>
                )
              )}

              {data.volumeByAsset
                .length === 0 && (
                <p className="py-4 text-sm text-gray-500">
                  No completed exchange volume
                  yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              HnC Exchange Fees
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Fees recorded on completed
              exchanges.
            </p>

            <div className="mt-5 space-y-3">
              {data.feesByAsset.map(
                (item) => (
                  <div
                    key={item.asset}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <span className="font-semibold text-gray-700">
                      {item.asset}
                    </span>

                    <span className="font-bold text-green-600">
                      +
                      {formatAmount(
                        item.amount,
                        item.asset
                      )}{" "}
                      {item.asset}
                    </span>
                  </div>
                )
              )}

              {data.feesByAsset
                .length === 0 && (
                <p className="py-4 text-sm text-gray-500">
                  No exchange fees recorded
                  yet.
                </p>
              )}
            </div>
          </div>

        </section>

        {/* FILTERS */}

        <section className="mt-10">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Exchange Records
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredOrders.length} of{" "}
                  {data.orders.length} records
                  shown.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter(
                    "all"
                  );
                  setAssetFilter(
                    "all"
                  );
                  setSearch("");
                }}
                className="w-fit rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Search
                </label>

                <input
                  type="search"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Customer, ID, quote..."
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                >
                  <option value="all">
                    All statuses
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="processing">
                    Processing
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="failed">
                    Failed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                  <option value="expired">
                    Expired
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Asset
                </label>

                <select
                  value={
                    assetFilter
                  }
                  onChange={(e) =>
                    setAssetFilter(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-blue-500"
                >
                  <option value="all">
                    All assets
                  </option>

                  {availableAssets.map(
                    (asset) => (
                      <option
                        key={asset}
                        value={asset}
                      >
                        {asset}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>
          </div>
        </section>

        {/* TABLE */}

        <section className="mt-6">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">

            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-gray-600">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-600">
                      Exchange
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-gray-600">
                      Pay
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-gray-600">
                      Receive
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-gray-600">
                      Rate
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-gray-600">
                      Fee
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-600">
                      Provider
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-600">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="border-t border-gray-100 align-top hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {
                              order
                                .customer
                                .fullName
                            }
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            {order
                              .customer
                              .username && (
                              <span className="text-xs text-gray-500">
                                @
                                {
                                  order
                                    .customer
                                    .username
                                }
                              </span>
                            )}

                            {order
                              .customer
                              .verified && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                VERIFIED
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-gray-900">
                            {
                              order.fromAsset
                            }
                          </span>

                          <span className="mx-2 text-gray-400">
                            →
                          </span>

                          <span className="font-bold text-blue-700">
                            {
                              order.toAsset
                            }
                          </span>

                          <p className="mt-2 max-w-[180px] truncate text-xs text-gray-400">
                            ID:{" "}
                            {order.id}
                          </p>

                          {order.quoteId && (
                            <p className="max-w-[180px] truncate text-xs text-gray-400">
                              Quote:{" "}
                              {
                                order.quoteId
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-gray-900">
                            {formatAmount(
                              order.fromAmount,
                              order.fromAsset
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              order.fromAsset
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-gray-900">
                            {formatAmount(
                              order.toAmount,
                              order.toAsset
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              order.toAsset
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="whitespace-nowrap font-semibold text-gray-800">
                            1{" "}
                            {
                              order.fromAsset
                            }{" "}
                            ={" "}
                            {formatRate(
                              order.rate
                            )}{" "}
                            {
                              order.toAsset
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <p className="font-bold text-green-600">
                            +
                            {formatAmount(
                              order.fee,
                              order.toAsset
                            )}
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              order.toAsset
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-700">
                            {
                              order.provider ||
                              "—"
                            }
                          </p>

                          {order.providerReference && (
                            <p className="mt-1 max-w-[160px] truncate text-xs text-gray-400">
                              {
                                order.providerReference
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                              order.status
                            )}`}
                          >
                            {statusLabel(
                              order.status
                            )}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                          {formatDate(
                            order.createdAt
                          )}

                          {order.completedAt && (
                            <p className="mt-1 text-xs text-green-600">
                              Completed{" "}
                              {formatDate(
                                order.completedAt
                              )}
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                  )}

                  {filteredOrders.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-5 py-12 text-center text-gray-500"
                      >
                        No exchange records
                        match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SAFETY NOTICE */}

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <strong>
            🔐 Exchange Management — Read Only
          </strong>

          <p className="mt-2">
            This administrative screen is for
            monitoring and auditing exchange
            activity. It does not execute, cancel,
            modify or settle customer exchanges.
            Live provider execution remains
            controlled separately.
          </p>
        </section>

      </div>
    </main>
  );
}