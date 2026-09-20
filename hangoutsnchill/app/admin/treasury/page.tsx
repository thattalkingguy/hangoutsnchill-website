"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type TreasuryAsset = {
  asset: string;
  asset_type: "fiat" | "crypto";
  balance: number;
  available_balance: number;
  locked_balance: number;
};

type Revenue = {
  id: string;
  revenue_type: string;
  asset: string;
  asset_type: "fiat" | "crypto";
  amount: number;
  source: string | null;
  reference: string | null;
  description: string | null;
  status: string;
  created_at: string;
};

type TreasuryTransaction = {
  id: string;
  transaction_type: string;
  asset: string;
  asset_type: "fiat" | "crypto";
  amount: number;
  balance_before: number | null;
  balance_after: number | null;
  reference: string | null;
  description: string | null;
  status: string;
  provider: string | null;
  provider_reference: string | null;
  created_at: string;
};

type TreasurySettings = {
  id?: string;
  preferred_asset: string;
  auto_convert_enabled: boolean;
  withdrawals_enabled: boolean;
  updated_at?: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;

  admin?: {
    id: string;
    fullName: string | null;
    role: string;
    verified: boolean;
  };

  treasury?: TreasuryAsset[];
  revenue?: Revenue[];
  transactions?: TreasuryTransaction[];

  settings?: TreasurySettings;
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

function revenueLabel(type: string) {
  switch (type) {
    case "exchange_fee":
      return "Exchange Fees";

    case "withdrawal_fee":
      return "Withdrawal Fees";

    case "marketplace_commission":
      return "Marketplace Commission";

    case "affiliate":
      return "Affiliate Revenue";

    default:
      return type
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );
  }
}

export default function TreasuryPage() {
  const [treasury, setTreasury] =
    useState<TreasuryAsset[]>([]);

  const [revenues, setRevenues] =
    useState<Revenue[]>([]);

  const [transactions, setTransactions] =
    useState<TreasuryTransaction[]>([]);

  const [settings, setSettings] =
    useState<TreasurySettings>({
      preferred_asset: "USDT",
      auto_convert_enabled: false,
      withdrawals_enabled: false,
    });

  const [assets, setAssets] =
    useState<TreasuryAsset[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingSettings, setSavingSettings] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [authorized, setAuthorized] =
    useState(false);

  const [adminName, setAdminName] =
    useState("");

  useEffect(() => {
    loadTreasury();
  }, []);

  async function getAccessToken() {
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
        "Please log in to access HnC Treasury."
      );
    }

    return session.access_token;
  }

  async function loadTreasury() {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        await getAccessToken();

      const [
        treasuryResponse,
        settingsResponse,
        assetsResponse,
      ] = await Promise.all([
        fetch("/api/admin/treasury", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }),

        fetch(
          "/api/admin/treasury/settings",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        ),

        supabase
          .from("supported_assets")
          .select(
            "symbol,asset_type,exchange_enabled,enabled"
          )
          .eq("enabled", true)
          .eq("exchange_enabled", true)
          .order("symbol"),
      ]);

      const treasuryData: ApiResponse =
        await treasuryResponse.json();

      const settingsData: ApiResponse =
        await settingsResponse.json();

      const {
        data: supportedAssets,
        error: supportedAssetError,
      } = assetsResponse;

      if (
        !treasuryResponse.ok ||
        !treasuryData.success
      ) {
        throw new Error(
          treasuryData.message ||
            "Unable to load HnC Treasury."
        );
      }

      if (
        !settingsResponse.ok ||
        !settingsData.success
      ) {
        throw new Error(
          settingsData.message ||
            "Unable to load treasury settings."
        );
      }

      if (supportedAssetError) {
        console.error(
          supportedAssetError
        );
      }

      setAuthorized(true);

      setAdminName(
        treasuryData.admin?.fullName ||
          "HnC Administrator"
      );

      setTreasury(
        (treasuryData.treasury || []).map(
          (item) => ({
            ...item,
            balance: Number(
              item.balance
            ),
            available_balance: Number(
              item.available_balance
            ),
            locked_balance: Number(
              item.locked_balance
            ),
          })
        )
      );

      setRevenues(
        (treasuryData.revenue || []).map(
          (item) => ({
            ...item,
            amount: Number(
              item.amount
            ),
          })
        )
      );

      setTransactions(
        (
          treasuryData.transactions || []
        ).map((item) => ({
          ...item,
          amount: Number(
            item.amount
          ),
          balance_before:
            item.balance_before === null
              ? null
              : Number(
                  item.balance_before
                ),
          balance_after:
            item.balance_after === null
              ? null
              : Number(
                  item.balance_after
                ),
        }))
      );

      if (settingsData.settings) {
        setSettings({
          preferred_asset:
            settingsData.settings
              .preferred_asset ||
            "USDT",

          auto_convert_enabled:
            settingsData.settings
              .auto_convert_enabled ===
            true,

          withdrawals_enabled:
            settingsData.settings
              .withdrawals_enabled ===
            true,

          id:
            settingsData.settings.id,

          updated_at:
            settingsData.settings.updated_at,
        });
      }

      setAssets(
        (supportedAssets || []).map(
          (asset) => ({
            asset: asset.symbol,
            asset_type:
              asset.asset_type,
            balance: 0,
            available_balance: 0,
            locked_balance: 0,
          })
        )
      );
    } catch (error) {
      console.error(
        "Treasury loading error:",
        error
      );

      setAuthorized(false);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load HnC Treasury."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setSavingSettings(true);
      setError("");
      setSuccess("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/admin/treasury/settings",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            preferredAsset:
              settings.preferred_asset,

            autoConvertEnabled:
              settings.auto_convert_enabled,
          }),
        }
      );

      const data: ApiResponse =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save treasury settings."
        );
      }

      if (data.settings) {
        setSettings({
          id: data.settings.id,

          preferred_asset:
            data.settings
              .preferred_asset,

          auto_convert_enabled:
            data.settings
              .auto_convert_enabled ===
            true,

          withdrawals_enabled:
            data.settings
              .withdrawals_enabled ===
            true,

          updated_at:
            data.settings.updated_at,
        });
      }

      setSuccess(
        "Treasury settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Treasury settings save error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save treasury settings."
      );
    } finally {
      setSavingSettings(false);
    }
  }

  const revenueByAsset = useMemo(() => {
    const totals: Record<
      string,
      number
    > = {};

    for (const revenue of revenues) {
      if (
        revenue.status ===
        "cancelled"
      ) {
        continue;
      }

      totals[revenue.asset] =
        (totals[revenue.asset] ||
          0) + revenue.amount;
    }

    return totals;
  }, [revenues]);

  const revenueByType = useMemo(() => {
    const totals: Record<
      string,
      {
        amount: number;
        asset: string;
      }
    > = {};

    for (const revenue of revenues) {
      if (
        revenue.status ===
        "cancelled"
      ) {
        continue;
      }

      if (
        !totals[
          revenue.revenue_type
        ]
      ) {
        totals[
          revenue.revenue_type
        ] = {
          amount: 0,
          asset: revenue.asset,
        };
      }

      totals[
        revenue.revenue_type
      ].amount += revenue.amount;
    }

    return totals;
  }, [revenues]);

  const totalRevenueRecords =
    revenues.filter(
      (revenue) =>
        revenue.status !==
        "cancelled"
    ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading HnC Treasury...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">
          <div className="text-4xl">
            🔒
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Treasury Access Restricted
          </h1>

          <p className="mt-3 text-gray-600">
            {error ||
              "You are not authorized to access HnC Treasury."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="rounded-3xl bg-gray-900 p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                HnC Administration
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                Treasury
              </h1>

              <p className="mt-3 text-gray-300">
                Central view of HnC platform
                revenue, treasury balances
                and treasury activity.
              </p>

              <p className="mt-3 text-sm text-gray-400">
                Administrator:{" "}
                <span className="font-semibold text-white">
                  {adminName}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Revenue Records
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalRevenueRecords}
              </p>
            </div>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {success}
          </div>
        )}

        {/* TREASURY CONTROL */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Treasury Controls
            </h2>

            <p className="text-gray-500">
              Configure how HnC intends to
              manage accumulated platform
              revenue.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">

            <div className="grid gap-6 md:grid-cols-2">

              {/* PREFERRED ASSET */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Preferred Treasury Asset
                </label>

                <select
                  value={
                    settings.preferred_asset
                  }
                  onChange={(e) =>
                    setSettings(
                      (current) => ({
                        ...current,
                        preferred_asset:
                          e.target.value,
                      })
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 font-semibold text-gray-900 outline-none focus:border-blue-500"
                >
                  {assets.map((asset) => (
                    <option
                      key={asset.asset}
                      value={asset.asset}
                    >
                      {asset.asset}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-gray-500">
                  Future treasury
                  consolidation can use
                  this asset as the preferred
                  destination.
                </p>
              </div>

              {/* AUTO CONVERSION */}

              <div className="rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Automatic Conversion
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Preference only. No
                      automatic funds movement
                      is active yet.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSettings(
                        (current) => ({
                          ...current,
                          auto_convert_enabled:
                            !current.auto_convert_enabled,
                        })
                      )
                    }
                    className={`relative h-7 w-12 rounded-full transition ${
                      settings.auto_convert_enabled
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                    aria-label="Toggle automatic conversion"
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        settings.auto_convert_enabled
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      settings.auto_convert_enabled
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {settings.auto_convert_enabled
                      ? "Preference ON"
                      : "OFF"}
                  </span>
                </div>
              </div>
            </div>

            {/* WITHDRAWAL STATUS */}

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="font-bold text-amber-900">
                    Treasury Withdrawals
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    Withdrawals remain disabled
                    until HnC production provider
                    integration and compliance
                    controls are completed.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-amber-200 px-4 py-2 text-xs font-bold text-amber-900">
                  🔐 LOCKED
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={savingSettings}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingSettings
                ? "Saving..."
                : "Save Treasury Settings"}
            </button>

            {settings.updated_at && (
              <p className="mt-3 text-xs text-gray-400">
                Last updated:{" "}
                {formatDate(
                  settings.updated_at
                )}
              </p>
            )}
          </div>
        </section>

        {/* TREASURY BALANCES */}

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Treasury Holdings
            </h2>

            <p className="text-gray-500">
              Current HnC platform balances by
              asset.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {treasury
              .filter(
                (item) =>
                  item.balance > 0 ||
                  item.asset ===
                    settings.preferred_asset
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

                    {item.asset ===
                      settings.preferred_asset && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                        Preferred
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-2xl font-bold text-gray-900">
                    {formatAmount(
                      item.balance,
                      item.asset
                    )}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Available:{" "}
                    {formatAmount(
                      item.available_balance,
                      item.asset
                    )}
                  </p>

                  {item.locked_balance >
                    0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      Locked:{" "}
                      {formatAmount(
                        item.locked_balance,
                        item.asset
                      )}
                    </p>
                  )}
                </div>
              ))}

            {treasury.filter(
              (item) =>
                item.balance > 0 ||
                item.asset ===
                  settings.preferred_asset
            ).length === 0 && (
              <div className="rounded-2xl bg-white p-6 text-gray-500">
                No treasury balances found.
              </div>
            )}
          </div>
        </section>

        {/* REVENUE BY ASSET */}

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Revenue by Asset
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(
              revenueByAsset
            ).map(
              ([asset, amount]) => (
                <div
                  key={asset}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                >
                  <p className="text-sm font-semibold text-gray-500">
                    {asset}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-green-600">
                    +
                    {formatAmount(
                      amount,
                      asset
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Recorded platform revenue
                  </p>
                </div>
              )
            )}

            {Object.keys(
              revenueByAsset
            ).length === 0 && (
              <div className="rounded-2xl bg-white p-6 text-gray-500">
                No revenue recorded yet.
              </div>
            )}
          </div>
        </section>

        {/* REVENUE SOURCES */}

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Revenue Sources
          </h2>

          <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            {Object.entries(
              revenueByType
            ).map(
              ([type, data]) => (
                <div
                  key={type}
                  className="flex items-center justify-between border-b border-gray-100 px-5 py-4 last:border-b-0"
                >
                  <span className="font-semibold text-gray-800">
                    {revenueLabel(type)}
                  </span>

                  <span className="font-bold text-gray-900">
                    {formatAmount(
                      data.amount,
                      data.asset
                    )}{" "}
                    {data.asset}
                  </span>
                </div>
              )
            )}

            {Object.keys(
              revenueByType
            ).length === 0 && (
              <div className="p-6 text-gray-500">
                No revenue sources recorded yet.
              </div>
            )}
          </div>
        </section>

        {/* RECENT REVENUE */}

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Revenue
            </h2>

            <p className="text-gray-500">
              Latest HnC platform revenue
              records.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Asset
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-gray-600">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Source
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
                {revenues
                  .slice(0, 20)
                  .map((revenue) => (
                    <tr
                      key={revenue.id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {revenueLabel(
                          revenue.revenue_type
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {revenue.asset}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-green-600">
                        +
                        {formatAmount(
                          revenue.amount,
                          revenue.asset
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {revenue.source ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                          {revenue.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                        {formatDate(
                          revenue.created_at
                        )}
                      </td>
                    </tr>
                  ))}

                {revenues.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      No revenue records
                      found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TREASURY ACTIVITY */}

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Treasury Activity
            </h2>

            <p className="text-gray-500">
              Audit trail for treasury
              movements.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Asset
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-gray-600">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Description
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Provider
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions
                  .slice(0, 20)
                  .map(
                    (transaction) => (
                      <tr
                        key={
                          transaction.id
                        }
                        className="border-t border-gray-100"
                      >
                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {transaction.transaction_type
                            .replaceAll(
                              "_",
                              " "
                            )
                            .replace(
                              /\b\w/g,
                              (char) =>
                                char.toUpperCase()
                            )}
                        </td>

                        <td className="px-5 py-4">
                          {transaction.asset}
                        </td>

                        <td
                          className={`px-5 py-4 text-right font-bold ${
                            transaction.amount >=
                            0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount >=
                          0
                            ? "+"
                            : ""}
                          {formatAmount(
                            transaction.amount,
                            transaction.asset
                          )}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {transaction.description ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {transaction.provider ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            {
                              transaction.status
                            }
                          </span>
                        </td>
                      </tr>
                    )
                  )}

                {transactions.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      No treasury activity
                      found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SAFETY NOTICE */}

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <strong>
            🔐 Treasury Safety Mode
          </strong>

          <p className="mt-2">
            Treasury conversion and
            withdrawals are not executing
            automatically. The preferred
            asset setting is currently a
            control preference only.
          </p>
        </div>

      </div>
    </main>
  );
}