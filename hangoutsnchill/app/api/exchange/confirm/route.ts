import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/*
 * HnC Exchange — SAFE SIMULATION CONFIRMATION
 *
 * This endpoint executes ONLY against:
 *
 *   simulation_wallet_accounts
 *   simulation_wallet_transactions
 *
 * It does NOT touch the user's real wallet_accounts balance.
 *
 * Real provider execution will be added later when the
 * Quidax production integration is approved and ready.
 */

const SIMULATION_MODE = true;

export async function POST(req: Request) {
  try {
    /*
     * --------------------------------------------------------
     * SAFE MODE
     * --------------------------------------------------------
     */

    if (!SIMULATION_MODE) {
      return NextResponse.json(
        {
          success: false,
          testMode: false,
          message:
            "Exchange simulation is currently disabled.",
        },
        { status: 403 }
      );
    }

    /*
     * --------------------------------------------------------
     * AUTHENTICATION
     * --------------------------------------------------------
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
      authHeader.substring(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is missing.",
        },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
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
     * --------------------------------------------------------
     * REQUEST
     * --------------------------------------------------------
     */

    const body = await req.json();

    const exchangeOrderId = String(
      body?.exchangeOrderId || ""
    ).trim();

    if (!exchangeOrderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing exchange order ID.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------------
     * LOAD STORED EXCHANGE ORDER
     *
     * Never trust amount/rate/assets sent by the browser.
     * The stored quote is the source of truth.
     * --------------------------------------------------------
     */

    const {
      data: exchangeOrder,
      error: orderError,
    } = await supabaseAdmin
      .from("exchange_orders")
      .select(
        `
        id,
        user_id,
        from_asset,
        to_asset,
        from_amount,
        to_amount,
        rate,
        fee,
        status,
        quote_id,
        quote_expires_at
      `
      )
      .eq("id", exchangeOrderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Exchange order lookup failed:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load exchange order.",
        },
        { status: 500 }
      );
    }

    if (!exchangeOrder) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Exchange order not found.",
        },
        { status: 404 }
      );
    }

    /*
     * --------------------------------------------------------
     * IDEMPOTENCY
     * --------------------------------------------------------
     */

    if (exchangeOrder.status === "completed") {
      return NextResponse.json({
        success: true,
        testMode: true,
        alreadyProcessed: true,
        message:
          "This exchange has already been completed.",
        exchangeOrderId:
          exchangeOrder.id,
      });
    }

    if (exchangeOrder.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          testMode: true,
          message:
            `This exchange cannot be completed because its current status is "${exchangeOrder.status}".`,
        },
        { status: 409 }
      );
    }

    /*
     * --------------------------------------------------------
     * QUOTE EXPIRY
     * --------------------------------------------------------
     */

    if (exchangeOrder.quote_expires_at) {
      const expiresAt =
        new Date(
          exchangeOrder.quote_expires_at
        ).getTime();

      if (
        !Number.isFinite(expiresAt) ||
        expiresAt <= Date.now()
      ) {
        await supabaseAdmin
          .from("exchange_orders")
          .update({
            status: "expired",
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", exchangeOrder.id)
          .eq("user_id", user.id)
          .eq("status", "pending");

        return NextResponse.json(
          {
            success: false,
            testMode: true,
            message:
              "This exchange quote has expired. Please request a new quote.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * --------------------------------------------------------
     * VALIDATE STORED QUOTE
     * --------------------------------------------------------
     */

    const fromAmount = Number(
      exchangeOrder.from_amount
    );

    const toAmount = Number(
      exchangeOrder.to_amount
    );

    const fee = Number(
      exchangeOrder.fee
    );

    const rate = Number(
      exchangeOrder.rate
    );

    const fromAsset = String(
      exchangeOrder.from_asset || ""
    )
      .trim()
      .toUpperCase();

    const toAsset = String(
      exchangeOrder.to_asset || ""
    )
      .trim()
      .toUpperCase();

    if (
      !fromAsset ||
      !toAsset ||
      fromAsset === toAsset
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The stored exchange quote has invalid assets.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(fromAmount) ||
      fromAmount <= 0 ||
      !Number.isFinite(toAmount) ||
      toAmount <= 0 ||
      !Number.isFinite(rate) ||
      rate <= 0 ||
      !Number.isFinite(fee) ||
      fee < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The stored exchange quote is invalid.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------------
     * EXECUTE SIMULATION
     *
     * The database function performs the actual balance
     * movement atomically.
     * --------------------------------------------------------
     */

    const {
      data: simulationResult,
      error: simulationError,
    } = await supabaseAdmin.rpc(
      "execute_simulation_exchange",
      {
        p_user_id: user.id,
        p_exchange_order_id:
          exchangeOrder.id,
      }
    );

    if (simulationError) {
      console.error(
        "Simulation exchange failed:",
        simulationError
      );

      return NextResponse.json(
        {
          success: false,
          testMode: true,
          message:
            "Unable to complete the simulated exchange.",
        },
        { status: 500 }
      );
    }

    if (!simulationResult?.success) {
      return NextResponse.json(
        {
          success: false,
          testMode: true,
          message:
            simulationResult?.message ||
            "Simulation exchange could not be completed.",
          availableBalance:
            simulationResult?.available_balance,
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------------
     * SUCCESS
     * --------------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      testMode: true,
      realFundsMoved: false,

      message:
        simulationResult.message ||
        "Simulation exchange completed successfully.",

      exchangeOrderId:
        simulationResult.exchange_order_id ||
        exchangeOrder.id,

      fromAsset:
        simulationResult.from_asset ||
        fromAsset,

      fromAmount:
        simulationResult.from_amount ??
        fromAmount,

      toAsset:
        simulationResult.to_asset ||
        toAsset,

      toAmount:
        simulationResult.to_amount ??
        toAmount,

      fee:
        simulationResult.fee ??
        fee,

      completedAt:
        simulationResult.completed_at ||
        new Date().toISOString(),

      provider:
        "HNC_SIMULATION",
    });
  } catch (error) {
    console.error(
      "Exchange confirmation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        testMode: true,
        message:
          "Unable to complete exchange.",
      },
      { status: 500 }
    );
  }
}