"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Asset = {
  symbol: string;
  name: string;
  asset_type: "fiat" | "crypto";
  exchange_enabled: boolean;
  decimals: number;
};

type Quote = {
  id: string;
  quoteId: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: number;
  grossAmount: number;
  fee: number;
  feePercent: number;
  receiveAmount: number;
  rate: number;
  expiresAt: string;
};

type SimulationResult = {
  fromAsset: string;
  fromAmount: number;
  toAsset: string;
  toAmount: number;
  fee: number;
};

export default function ExchangePage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  const [fromAsset, setFromAsset] = useState("NGN");
  const [toAsset, setToAsset] = useState("USDT");
  const [amount, setAmount] = useState("");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [result, setResult] =
    useState<SimulationResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);
  const [confirming, setConfirming] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  const cryptoAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.asset_type === "crypto"
      ),
    [assets]
  );

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (!quote) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(
            quote.expiresAt
          ).getTime() -
            Date.now()) /
            1000
        )
      );

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setQuote(null);
        setError(
          "Your exchange quote has expired. Please request a new quote."
        );
      }
    };

    updateTimer();

    const timer = window.setInterval(
      updateTimer,
      1000
    );

    return () =>
      window.clearInterval(timer);
  }, [quote]);

  async function loadAssets() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "Please log in to use HnC Exchange."
        );
        return;
      }

      const {
        data,
        error: assetError,
      } = await supabase
        .from("supported_assets")
        .select(
          "symbol,name,asset_type,exchange_enabled,decimals"
        )
        .eq("enabled", true)
        .eq("exchange_enabled", true)
        .order("asset_type")
        .order("symbol");

      if (assetError) {
        console.error(assetError);

        setError(
          "Unable to load supported exchange assets."
        );

        return;
      }

      setAssets(data || []);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load the exchange."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearMessages() {
    setError("");
    setSuccess("");
    setResult(null);
  }

  function swapAssets() {
    const oldFrom = fromAsset;

    setFromAsset(toAsset);
    setToAsset(oldFrom);

    setQuote(null);
    clearMessages();
  }

  async function getQuote() {
    setError("");
    setSuccess("");
    setResult(null);
    setQuote(null);

    const value = Number(amount);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      setError("Enter a valid amount.");
      return;
    }

    if (fromAsset === toAsset) {
      setError(
        "Choose two different assets."
      );
      return;
    }

    setQuoting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(
          "Your session has expired. Please log in again."
        );
        return;
      }

      const response = await fetch(
        "/api/exchange/quote",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            fromAsset,
            toAsset,
            amount: value,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to generate quote."
        );
        return;
      }

      setQuote(data.quote);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the exchange service."
      );
    } finally {
      setQuoting(false);
    }
  }

  async function confirmExchange() {
    if (!quote) {
      setError(
        "There is no active exchange quote."
      );
      return;
    }

    if (secondsLeft <= 0) {
      setError(
        "This exchange quote has expired."
      );
      return;
    }

    setError("");
    setSuccess("");
    setConfirming(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(
          "Your session has expired. Please log in again."
        );
        return;
      }

      const response = await fetch(
        "/api/exchange/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            exchangeOrderId: quote.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to complete exchange."
        );
        return;
      }

      setResult({
        fromAsset:
          data.fromAsset,
        fromAmount:
          Number(data.fromAmount),
        toAsset:
          data.toAsset,
        toAmount:
          Number(data.toAmount),
        fee:
          Number(data.fee || 0),
      });

      setSuccess(
        data.alreadyProcessed
          ? "This simulation exchange was already completed."
          : "🎉 Simulation exchange completed successfully."
      );

      setQuote(null);
      setAmount("");
      setSecondsLeft(0);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the exchange confirmation service."
      );
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading HnC Exchange...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">

          {/* Header */}

          <div className="bg-gray-900 p-6 text-white md:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              HnC Wallet
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Exchange
            </h1>

            <p className="mt-3 text-gray-300">
              Exchange supported fiat and crypto
              assets within HangoutsNChill.
            </p>
          </div>

          {/* Safe mode banner */}

          <div className="border-b border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <div className="text-xl">
                🧪
              </div>

              <div>
                <p className="font-bold text-amber-900">
                  HnC Exchange Test Mode
                </p>

                <p className="mt-1 text-sm text-amber-800">
                  This is a simulated exchange.
                  No real crypto or fiat funds
                  are moved.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                {success}
              </div>
            )}

            {/* Exchange form */}

            <div className="space-y-5">

              <div>
                <label className="mb-2 block font-semibold text-gray-800">
                  You Pay
                </label>

                <div className="flex gap-3">
                  <select
                    value={fromAsset}
                    onChange={(e) => {
                      setFromAsset(
                        e.target.value
                      );
                      setQuote(null);
                      clearMessages();
                    }}
                    className="w-36 rounded-xl border border-gray-300 bg-white p-3 font-semibold outline-none focus:border-blue-500"
                  >
                    {assets.map(
                      (asset) => (
                        <option
                          key={
                            asset.symbol
                          }
                          value={
                            asset.symbol
                          }
                        >
                          {
                            asset.symbol
                          }
                        </option>
                      )
                    )}
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => {
                      setAmount(
                        e.target.value
                      );
                      setQuote(null);
                      clearMessages();
                    }}
                    placeholder="0.00"
                    className="min-w-0 flex-1 rounded-xl border border-gray-300 p-3 text-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Swap */}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={
                    swapAssets
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-xl shadow-sm hover:bg-gray-50"
                  aria-label="Swap assets"
                >
                  ⇅
                </button>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-800">
                  You Receive
                </label>

                <select
                  value={toAsset}
                  onChange={(e) => {
                    setToAsset(
                      e.target.value
                    );
                    setQuote(null);
                    clearMessages();
                  }}
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 font-semibold outline-none focus:border-blue-500"
                >
                  {assets.map(
                    (asset) => (
                      <option
                        key={
                          asset.symbol
                        }
                        value={
                          asset.symbol
                        }
                      >
                        {
                          asset.symbol
                        }{" "}
                        —{" "}
                        {
                          asset.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={
                  getQuote
                }
                disabled={
                  quoting ||
                  confirming
                }
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {quoting
                  ? "Getting Quote..."
                  : "Get Exchange Quote"}
              </button>
            </div>

            {/* Quote */}

            {quote && (
              <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Exchange Quote
                  </h2>

                  <span
                    className={`rounded-full bg-white px-3 py-1 text-sm font-semibold ${
                      secondsLeft <=
                      10
                        ? "text-red-600"
                        : "text-blue-700"
                    }`}
                  >
                    {secondsLeft}s
                  </span>
                </div>

                <div className="mt-6 space-y-4">

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      You pay
                    </span>

                    <strong>
                      {quote.fromAmount.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits:
                            8,
                        }
                      )}{" "}
                      {
                        quote.fromAsset
                      }
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Rate
                    </span>

                    <strong>
                      1{" "}
                      {
                        quote.fromAsset
                      }{" "}
                      ={" "}
                      {quote.rate.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits:
                            8,
                        }
                      )}{" "}
                      {
                        quote.toAsset
                      }
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Gross amount
                    </span>

                    <strong>
                      {quote.grossAmount.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits:
                            8,
                        }
                      )}{" "}
                      {
                        quote.toAsset
                      }
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      HnC fee (
                      {
                        quote.feePercent
                      }
                      %)
                    </span>

                    <strong>
                      {quote.fee.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits:
                            8,
                        }
                      )}{" "}
                      {
                        quote.toAsset
                      }
                    </strong>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex justify-between gap-4">
                      <span className="font-semibold text-gray-800">
                        You receive
                      </span>

                      <strong className="text-xl text-blue-700">
                        {quote.receiveAmount.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits:
                              8,
                          }
                        )}{" "}
                        {
                          quote.toAsset
                        }
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-white p-4 text-sm text-gray-600">
                  <strong>
                    Quote ID:
                  </strong>{" "}
                  {quote.quoteId}

                  <br />

                  Quote expires in{" "}
                  {secondsLeft}{" "}
                  seconds.

                  <br />

                  <span className="font-semibold text-green-700">
                    No real funds will be moved.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    confirmExchange
                  }
                  disabled={
                    confirming ||
                    secondsLeft <= 0
                  }
                  className="mt-6 w-full rounded-xl bg-green-600 py-4 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {confirming
                    ? "Processing Test Exchange..."
                    : secondsLeft <=
                      0
                    ? "Quote Expired"
                    : "Confirm Test Exchange"}
                </button>
              </div>
            )}

            {/* Successful result */}

            {result && (
              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    ✅
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-green-900">
                      Exchange Successful
                    </h2>

                    <p className="text-sm text-green-700">
                      Simulation completed.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-white p-5">

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Sold
                    </span>

                    <strong>
                      {result.fromAmount.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits:
                            8,
                        }
                      )}{" "}
                      {
                        result.fromAsset
                      }
                    </strong>
                  </div>

                  <div className="my-4 border-t" />

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Received
                    </span>

                    <strong className="text-green-700">
                      {result.toAmount.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits:
                            8,
                        }
                      )}{" "}
                      {
                        result.toAsset
                      }
                    </strong>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-gray-500">
                      HnC fee
                    </span>

                    <span>
                      {result.fee.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits:
                            8,
                        }
                      )}{" "}
                      {
                        result.toAsset
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-green-200 bg-green-100 p-4 text-sm text-green-800">
                  🧪 This was a simulation only.
                  Your real HnC wallet was not
                  changed.
                </div>
              </div>
            )}

            {/* Supported assets */}

            <div className="mt-10">
              <h3 className="font-bold text-gray-900">
                Supported Exchange Assets
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {assets.map(
                  (asset) => (
                    <span
                      key={
                        asset.symbol
                      }
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      {
                        asset.symbol
                      }
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <strong className="text-gray-800">
                Production notice:
              </strong>{" "}
              Real crypto/fiat exchange execution
              will only be enabled after HnC's
              production provider integration,
              compliance controls and required
              approvals are complete.
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}