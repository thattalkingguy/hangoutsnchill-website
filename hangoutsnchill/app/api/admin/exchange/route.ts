import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAdminUser(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.substring(7);

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role, verified")
      .eq("id", user.id)
      .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin" ||
    profile.verified !== true
  ) {
    return null;
  }

  return {
    user,
    profile,
  };
}

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    /*
     * Read all exchange orders.
     *
     * This is an administrative monitoring endpoint only.
     * It does not execute, modify, cancel, or settle exchanges.
     */

    const { data: orders, error: ordersError } =
      await supabaseAdmin
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
          provider,
          provider_reference,
          quote_id,
          quote_expires_at,
          created_at,
          updated_at,
          completed_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

    if (ordersError) {
      console.error(
        "Admin exchange orders error:",
        ordersError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load exchange records.",
        },
        { status: 500 }
      );
    }

    /*
     * Load the related customer profiles.
     *
     * We deliberately fetch only the fields needed for
     * administrative identification.
     */

    const userIds = Array.from(
      new Set(
        (orders || [])
          .map((order) => order.user_id)
          .filter(Boolean)
      )
    );

    let profiles: any[] = [];

    if (userIds.length > 0) {
      const { data: profileRows, error: profilesError } =
        await supabaseAdmin
          .from("profiles")
          .select(
            "id, full_name, username, role, verified"
          )
          .in("id", userIds);

      if (profilesError) {
        console.error(
          "Admin exchange profiles error:",
          profilesError
        );
      } else {
        profiles = profileRows || [];
      }
    }

    const profileMap = new Map<
      string,
      any
    >();

    for (const profile of profiles) {
      profileMap.set(
        profile.id,
        profile
      );
    }

    /*
     * Add customer information to each exchange.
     */

    const exchangeOrders = (
      orders || []
    ).map((order) => {
      const profile =
        profileMap.get(
          order.user_id
        );

      return {
        id: order.id,

        userId:
          order.user_id,

        customer: {
          fullName:
            profile?.full_name ||
            "Unknown user",

          username:
            profile?.username ||
            null,

          verified:
            profile?.verified === true,
        },

        fromAsset:
          order.from_asset,

        toAsset:
          order.to_asset,

        fromAmount:
          Number(
            order.from_amount || 0
          ),

        toAmount:
          Number(
            order.to_amount || 0
          ),

        rate:
          Number(
            order.rate || 0
          ),

        fee:
          Number(
            order.fee || 0
          ),

        status:
          order.status,

        provider:
          order.provider,

        providerReference:
          order.provider_reference,

        quoteId:
          order.quote_id,

        quoteExpiresAt:
          order.quote_expires_at,

        createdAt:
          order.created_at,

        updatedAt:
          order.updated_at,

        completedAt:
          order.completed_at,
      };
    });

    /*
     * ---------------------------------------------------------
     * SUMMARY
     * ---------------------------------------------------------
     */

    const summary = {
      total:
        exchangeOrders.length,

      pending:
        exchangeOrders.filter(
          (order) =>
            order.status ===
              "pending" ||
            order.status ===
              "processing"
        ).length,

      completed:
        exchangeOrders.filter(
          (order) =>
            order.status ===
            "completed"
        ).length,

      failed:
        exchangeOrders.filter(
          (order) =>
            order.status ===
            "failed"
        ).length,

      cancelled:
        exchangeOrders.filter(
          (order) =>
            order.status ===
            "cancelled"
        ).length,

      expired:
        exchangeOrders.filter(
          (order) =>
            order.status ===
            "expired"
        ).length,
    };

    /*
     * ---------------------------------------------------------
     * VOLUME BY ASSET
     * ---------------------------------------------------------
     */

    const volumeMap: Record<
      string,
      number
    > = {};

    for (const order of exchangeOrders) {
      if (
        order.status !==
        "completed"
      ) {
        continue;
      }

      volumeMap[
        order.fromAsset
      ] =
        (volumeMap[
          order.fromAsset
        ] || 0) +
        order.fromAmount;
    }

    const volumeByAsset =
      Object.entries(
        volumeMap
      ).map(
        ([asset, amount]) => ({
          asset,
          amount,
        })
      );

    /*
     * ---------------------------------------------------------
     * FEES BY ASSET
     * ---------------------------------------------------------
     */

    const feeMap: Record<
      string,
      number
    > = {};

    for (const order of exchangeOrders) {
      if (
        order.status !==
        "completed"
      ) {
        continue;
      }

      feeMap[
        order.toAsset
      ] =
        (feeMap[
          order.toAsset
        ] || 0) +
        order.fee;
    }

    const feesByAsset =
      Object.entries(
        feeMap
      ).map(
        ([asset, amount]) => ({
          asset,
          amount,
        })
      );

    return NextResponse.json({
      success: true,

      admin: {
        fullName:
          admin.profile.full_name,

        role:
          admin.profile.role,

        verified:
          admin.profile.verified,
      },

      summary,

      volumeByAsset,

      feesByAsset,

      orders: exchangeOrders,
    });
  } catch (error) {
    console.error(
      "Admin exchange API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load admin exchange records.",
      },
      { status: 500 }
    );
  }
}