import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
 * ============================================================
 * HnC EXCHANGE TEST MODE
 * ============================================================
 *
 * Keep this TRUE while Quidax production execution is not
 * connected.
 *
 * In this mode:
 *
 *   balances -> simulation_wallet_accounts
 *   execution -> execute_simulation_exchange
 *   provider -> HNC_SIMULATION
 *
 * Real customer wallet balances are NOT used or modified.
 */

const EXCHANGE_TEST_MODE = true;

const HNC_EXCHANGE_FEE = 0.015;

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  AVAX: "avalanche-2",
  BCH: "bitcoin-cash",
  DOGE: "dogecoin",
  DOT: "polkadot",
  LINK: "chainlink",
  LTC: "litecoin",
  POL: "polygon-ecosystem-token",
  TRX: "tron",
};

const FIAT_ASSETS = new Set([
  "NGN",
  "USD",
  "EUR",
  "GBP",
]);

function generateQuoteId() {
  return `HNC-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

async function getCryptoRates(
  symbols: string[]
): Promise<Record<string, number>> {
  const ids = symbols
    .map((symbol) => COINGECKO_IDS[symbol])
    .filter(Boolean);

  if (ids.length === 0) {
    return {};
  }

  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    `?ids=${encodeURIComponent(ids.join(","))}` +
    "&vs_currencies=ngn,usd" +
    "&include_last_updated_at=true";

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `CoinGecko returned ${response.status}`
    );
  }

  const data = await response.json();

  const result: Record<string, number> = {};

  for (const symbol of symbols) {
    const id = COINGECKO_IDS[symbol];

    if (!id || !data[id]) {
      continue;
    }

    const ngnPrice = Number(data[id].ngn);

    if (
      Number.isFinite(ngnPrice) &&
      ngnPrice > 0
    ) {
      result[symbol] = ngnPrice;
    }
  }

  return result;
}

async function getFiatRates(): Promise<
  Record<string, number>
> {
  const response = await fetch(
    "https://api.frankfurter.dev/v2/rates?base=EUR",
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `FX provider returned ${response.status}`
    );
  }

  const data = await response.json();

  const rates: Record<string, number> = {
    EUR: 1,
  };

  if (Array.isArray(data)) {
    for (const item of data) {
      if (
        item &&
        typeof item.quote === "string" &&
        Number.isFinite(Number(item.rate))
      ) {
        rates[item.quote] = Number(item.rate);
      }
    }
  }

  return rates;
}

export async function POST(req: Request) {
  try {
    /*
     * ============================================================
     * AUTHENTICATION
     * ============================================================
     */

    const authHeader =
      req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken =
      authHeader.substring(7);

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    /*
     * ============================================================
     * READ REQUEST
     * ============================================================
     */

    const body = await req.json();

    const fromAsset = String(
      body.fromAsset || ""
    )
      .trim()
      .toUpperCase();

    const toAsset = String(
      body.toAsset || ""
    )
      .trim()
      .toUpperCase();

    const amount = Number(body.amount);

    if (!fromAsset || !toAsset) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select both assets.",
        },
        { status: 400 }
      );
    }

    if (fromAsset === toAsset) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot exchange an asset for itself.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid amount.",
        },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * VALIDATE SUPPORTED ASSETS
     * ============================================================
     */

    const {
      data: fromAssetData,
      error: fromAssetError,
    } =
      await supabaseAdmin
        .from("supported_assets")
        .select(
          "symbol,name,asset_type,enabled,exchange_enabled,decimals"
        )
        .eq("symbol", fromAsset)
        .eq("enabled", true)
        .eq("exchange_enabled", true)
        .maybeSingle();

    if (fromAssetError) {
      console.error(
        "Source asset lookup failed:",
        fromAssetError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to validate source asset.",
        },
        { status: 500 }
      );
    }

    const {
      data: toAssetData,
      error: toAssetError,
    } =
      await supabaseAdmin
        .from("supported_assets")
        .select(
          "symbol,name,asset_type,enabled,exchange_enabled,decimals"
        )
        .eq("symbol", toAsset)
        .eq("enabled", true)
        .eq("exchange_enabled", true)
        .maybeSingle();

    if (toAssetError) {
      console.error(
        "Destination asset lookup failed:",
        toAssetError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to validate destination asset.",
        },
        { status: 500 }
      );
    }

    if (!fromAssetData) {
      return NextResponse.json(
        {
          success: false,
          message:
            `${fromAsset} is not currently available for exchange.`,
        },
        { status: 400 }
      );
    }

    if (!toAssetData) {
      return NextResponse.json(
        {
          success: false,
          message:
            `${toAsset} is not currently available for exchange.`,
        },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * CHECK SIMULATION BALANCE
     * ============================================================
     *
     * IMPORTANT:
     *
     * Test mode uses simulation_wallet_accounts.
     *
     * Real wallet_accounts are never consulted here.
     */

    const {
      data: simulationWallet,
      error: simulationWalletError,
    } =
      await supabaseAdmin
        .from(
          "simulation_wallet_accounts"
        )
        .select(
          "id,asset,balance,available_balance,locked_balance"
        )
        .eq("user_id", user.id)
        .eq("asset", fromAsset)
        .maybeSingle();

    if (simulationWalletError) {
      console.error(
        "Simulation wallet lookup failed:",
        simulationWalletError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to read simulation wallet balance.",
        },
        { status: 500 }
      );
    }

    const availableBalance =
      simulationWallet
        ? Number(
            simulationWallet.available_balance
          )
        : 0;

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          success: false,
          testMode: EXCHANGE_TEST_MODE,
          message:
            `Insufficient ${fromAsset} simulation balance.`,
          availableBalance,
        },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * GET LIVE REFERENCE RATES
     * ============================================================
     */

    const requiredCryptoSymbols = [
      fromAsset,
      toAsset,
    ].filter(
      (symbol) =>
        !FIAT_ASSETS.has(symbol)
    );

    const cryptoRates =
      await getCryptoRates(
        requiredCryptoSymbols
      );

    const fiatRates =
      await getFiatRates();

    /*
     * ============================================================
     * BUILD NGN-DENOMINATED RATES
     * ============================================================
     */

    const ratesInNgn: Record<
      string,
      number
    > = {};

    /*
     * NGN = 1 NGN
     */

    ratesInNgn.NGN = 1;

    /*
     * IMPORTANT:
     *
     * Frankfurter rates are EUR-based.
     *
     * We cannot safely pretend those values are NGN rates.
     *
     * For the current test engine, NGN is the only fiat
     * currency used as a direct reference against CoinGecko.
     *
     * Non-NGN fiat exchange execution remains unsuitable
     * for production until a proper NGN FX source is connected.
     */

    /*
     * Add crypto NGN prices.
     */

    for (const [
      symbol,
      price,
    ] of Object.entries(
      cryptoRates
    )) {
      ratesInNgn[symbol] = price;
    }

    /*
     * ============================================================
     * FIAT HANDLING
     * ============================================================
     *
     * For now:
     *
     * NGN ↔ crypto
     * crypto ↔ crypto
     *
     * are supported by the reference-rate engine.
     *
     * USD/EUR/GBP require a proper NGN FX bridge before
     * production execution.
     */

    if (
      (fromAsset === "USD" ||
        fromAsset === "EUR" ||
        fromAsset === "GBP") ||
      (toAsset === "USD" ||
        toAsset === "EUR" ||
        toAsset === "GBP")
    ) {
      return NextResponse.json(
        {
          success: false,
          testMode: EXCHANGE_TEST_MODE,
          message:
            "This fiat pair requires a dedicated live FX bridge and is not yet enabled.",
        },
        { status: 503 }
      );
    }

    /*
     * ============================================================
     * VALIDATE RATES
     * ============================================================
     */

    if (
      !ratesInNgn[fromAsset] ||
      !ratesInNgn[toAsset]
    ) {
      return NextResponse.json(
        {
          success: false,
          testMode: EXCHANGE_TEST_MODE,
          message:
            "A live conversion rate is not currently available for this pair.",
        },
        { status: 503 }
      );
    }

    /*
     * ============================================================
     * CALCULATE QUOTE
     * ============================================================
     */

    const fromRate =
      ratesInNgn[fromAsset];

    const toRate =
      ratesInNgn[toAsset];

    const grossNgnValue =
      amount * fromRate;

    const grossToAmount =
      grossNgnValue / toRate;

    const fee =
      grossToAmount *
      HNC_EXCHANGE_FEE;

    const receiveAmount =
      grossToAmount - fee;

    if (
      !Number.isFinite(
        grossToAmount
      ) ||
      !Number.isFinite(fee) ||
      !Number.isFinite(
        receiveAmount
      ) ||
      receiveAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to calculate a valid exchange amount.",
        },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * QUOTE EXPIRY
     * ============================================================
     */

    const quoteId =
      generateQuoteId();

    const quoteExpiresAt =
      new Date(
        Date.now() +
          60 * 1000
      ).toISOString();

    /*
     * ============================================================
     * STORE EXCHANGE ORDER
     * ============================================================
     */

    const {
      data: exchangeOrder,
      error: exchangeOrderError,
    } =
      await supabaseAdmin
        .from("exchange_orders")
        .insert({
          user_id: user.id,

          from_asset:
            fromAsset,

          to_asset:
            toAsset,

          from_amount:
            amount,

          to_amount:
            receiveAmount,

          rate:
            fromRate /
            toRate,

          fee,

          status:
            "pending",

          provider:
            EXCHANGE_TEST_MODE
              ? "HNC_SIMULATION"
              : "LIVE_REFERENCE_RATES",

          provider_reference:
            null,

          quote_id:
            quoteId,

          quote_expires_at:
            quoteExpiresAt,
        })
        .select("id")
        .single();

    if (
      exchangeOrderError ||
      !exchangeOrder
    ) {
      console.error(
        "Exchange quote storage failed:",
        exchangeOrderError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create exchange quote.",
        },
        { status: 500 }
      );
    }

    /*
     * ============================================================
     * RETURN QUOTE
     * ============================================================
     */

    return NextResponse.json({
      success: true,

      testMode:
        EXCHANGE_TEST_MODE,

      liveRates: true,

      quote: {
        id:
          exchangeOrder.id,

        quoteId,

        fromAsset,

        toAsset,

        fromAmount:
          amount,

        grossAmount:
          grossToAmount,

        fee,

        feePercent:
          HNC_EXCHANGE_FEE * 100,

        receiveAmount,

        rate:
          fromRate /
          toRate,

        expiresAt:
          quoteExpiresAt,
      },

      provider:
        EXCHANGE_TEST_MODE
          ? "CoinGecko + HNC Simulation"
          : "CoinGecko + Live Provider",

      warning:
        EXCHANGE_TEST_MODE
          ? "Test mode: simulation balances only. No real funds will be moved."
          : undefined,
    });
  } catch (error) {
    console.error(
      "Exchange quote error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to generate exchange quote.",
      },
      { status: 500 }
    );
  }
}