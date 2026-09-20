"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type DashboardData = {
  users: {
    total: number;
    verified: number;
    pending: number;
  };

  treasury: {
    asset: string;
    asset_type: "fiat" | "crypto";
    balance: number;
    available_balance: number;
    locked_balance: number;
  }[];

  revenue: {
    asset: string;
    amount: number;
  }[];

  exchanges: {
    total: number;
    pending: number;
    completed: number;
    volume: {
      asset: string;
      amount: number;
    }[];
  };

  withdrawals: {
    total: number;
    pending: number;
    completed: number;
  };

  recentActivity: {
    id: string;
    type: string;
    description: string;
    asset: string | null;
    amount: number | null;
    status: string;
    created_at: string;
  }[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: DashboardData;
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
      fiatAssets.includes(asset) ? 2 : 8,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function statusClass(status: string) {
  switch (status) {
    case "completed":
    case "earned":
      return "bg-green-100 text-green-700";

    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-700";

    case "failed":
    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AdminDashboard() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [adminName, setAdminName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

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
        "/api/admin/dashboard",
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
        !result.data
      ) {
        throw new Error(
          result.message ||
            "Unable to load HnC Admin Dashboard."
        );
      }

      setData(result.data);

      setAdminName(
        result.admin?.fullName ||
          "HnC Administrator"
      );
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load HnC Admin Dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading HnC Admin...
        </p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="text-4xl">
            🔒
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            HnC Admin
          </h1>

          <p className="mt-3 text-gray-600">
            {error ||
              "Unable to load the administration dashboard."}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const pendingActions =
    data.exchanges.pending +
    data.withdrawals.pending;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="rounded-3xl bg-gray-900 p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                HangoutsNChill
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                Admin Dashboard
              </h1>

              <p className="mt-3 text-gray-300">
                Welcome back, {adminName}.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Pending Actions
              </p>

              <p className="mt-1 text-3xl font-bold">
                {pendingActions}
              </p>
            </div>
          </div>
        </div>

        {/* OVERVIEW CARDS */}

        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* USERS */}

            <Link
              href="/admin/users"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-gray-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.users.total.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-green-600">
                {data.users.verified} verified
              </p>
            </Link>

            {/* REVENUE */}

            <Link
              href="/admin/treasury"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-gray-500">
                Revenue Assets
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.revenue.length}
              </p>

              <p className="mt-2 text-sm text-blue-600">
                View Treasury →
              </p>
            </Link>

            {/* EXCHANGE */}

            <Link
              href="/exchange"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-gray-500">
                Exchanges
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.exchanges.total.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-green-600">
                {data.exchanges.completed} completed
              </p>
            </Link>

            {/* WITHDRAWALS */}

            <Link
              href="/admin/withdrawals"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-gray-500">
                Withdrawals
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.withdrawals.total.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-amber-600">
                {data.withdrawals.pending} pending
              </p>
            </Link>
          </div>
        </section>

        {/* TREASURY */}

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                HnC Treasury
              </h2>

              <p className="mt-1 text-gray-500">
                Current platform holdings.
              </p>
            </div>

            <Link
              href="/admin/treasury"
              className="text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              Manage Treasury →
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.treasury
              .filter(
                (item) =>
                  item.balance > 0
              )
              .map((item) => (
                <div
                  key={item.asset}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-500">
                      {item.asset}
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                      {item.asset_type}
                    </span>
                  </div>

                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    {formatAmount(
                      item.balance,
                      item.asset
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Available{" "}
                    {formatAmount(
                      item.available_balance,
                      item.asset
                    )}
                  </p>
                </div>
              ))}

            {data.treasury.filter(
              (item) =>
                item.balance > 0
            ).length === 0 && (
              <div className="rounded-2xl bg-white p-6 text-gray-500">
                No treasury holdings yet.
              </div>
            )}
          </div>
        </section>

        {/* BUSINESS OPERATIONS */}

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Business Operations
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/admin/users"
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md"
            >
              <div className="text-2xl">
                👥
              </div>

              <h3 className="mt-3 font-bold text-gray-900">
                Users
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Manage accounts and verification.
              </p>
            </Link>

            <Link
              href="/admin/withdrawals"
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md"
            >
              <div className="text-2xl">
                💸
              </div>

              <h3 className="mt-3 font-bold text-gray-900">
                Withdrawals
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Review and manage payout requests.
              </p>
            </Link>

            <Link
              href="/admin/analytics"
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md"
            >
              <div className="text-2xl">
                📊
              </div>

              <h3 className="mt-3 font-bold text-gray-900">
                Analytics
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Monitor HnC platform performance.
              </p>
            </Link>

            <Link
              href="/admin/treasury"
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md"
            >
              <div className="text-2xl">
                🏦
              </div>

              <h3 className="mt-3 font-bold text-gray-900">
                Treasury
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Revenue, balances and controls.
              </p>
            </Link>

          </div>
        </section>

        {/* EXCHANGE SUMMARY */}

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Exchange Activity
              </h2>

              <p className="mt-1 text-gray-500">
                Current exchange engine status.
              </p>
            </div>

            <Link
              href="/exchange"
              className="text-sm font-bold text-blue-600"
            >
              Open Exchange →
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {data.exchanges.total}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {data.exchanges.completed}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {data.exchanges.pending}
              </p>
            </div>

          </div>
        </section>

        {/* RECENT ACTIVITY */}

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Activity
            </h2>

            <p className="text-gray-500">
              Latest activity across HnC.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Activity
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.recentActivity.map(
                  (activity) => (
                    <tr
                      key={activity.id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {activity.type}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {activity.description}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {activity.amount !== null &&
                        activity.asset
                          ? `${formatAmount(
                              activity.amount,
                              activity.asset
                            )} ${activity.asset}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(
                            activity.status
                          )}`}
                        >
                          {activity.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                        {formatDate(
                          activity.created_at
                        )}
                      </td>
                    </tr>
                  )
                )}

                {data.recentActivity.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      No recent activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECURITY */}

        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <strong>
            🔐 HnC Admin Security
          </strong>

          <p className="mt-2">
            Administrative financial data is
            accessed through protected server-side
            APIs. Treasury withdrawals and live
            provider execution remain locked until
            production controls are completed.
          </p>
        </section>

      </div>
    </main>
  );
}