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

function isMissingTableError(error: any) {
  return (
    error?.code === "42P01" ||
    String(error?.message || "")
      .toLowerCase()
      .includes("does not exist")
  );
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
     * ---------------------------------------------------------
     * USERS
     * ---------------------------------------------------------
     */

    const { count: totalUsers, error: usersError } =
      await supabaseAdmin
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        });

    if (usersError) {
      console.error(
        "Admin dashboard users error:",
        usersError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load user statistics.",
        },
        { status: 500 }
      );
    }

    const { count: verifiedUsers, error: verifiedError } =
      await supabaseAdmin
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("verified", true);

    if (verifiedError) {
      console.error(
        "Admin dashboard verified users error:",
        verifiedError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load verification statistics.",
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * TREASURY
     * ---------------------------------------------------------
     */

    const { data: treasury, error: treasuryError } =
      await supabaseAdmin
        .from("platform_treasury")
        .select(
          "asset,asset_type,balance,available_balance,locked_balance"
        )
        .order("asset");

    if (treasuryError) {
      console.error(
        "Admin dashboard treasury error:",
        treasuryError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load treasury information.",
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * PLATFORM REVENUE
     * ---------------------------------------------------------
     */

    const { data: revenueRows, error: revenueError } =
      await supabaseAdmin
        .from("platform_revenue")
        .select("asset,amount,status")
        .neq("status", "cancelled")
        .order("created_at", {
          ascending: false,
        });

    if (revenueError) {
      console.error(
        "Admin dashboard revenue error:",
        revenueError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load revenue information.",
        },
        { status: 500 }
      );
    }

    const revenueTotals: Record<
      string,
      number
    > = {};

    for (const row of revenueRows || []) {
      const amount = Number(row.amount);

      if (!Number.isFinite(amount)) {
        continue;
      }

      revenueTotals[row.asset] =
        (revenueTotals[row.asset] || 0) +
        amount;
    }

    const revenue = Object.entries(
      revenueTotals
    ).map(([asset, amount]) => ({
      asset,
      amount,
    }));

    /*
     * ---------------------------------------------------------
     * EXCHANGE ORDERS
     * ---------------------------------------------------------
     */

    const { data: exchangeRows, error: exchangeError } =
      await supabaseAdmin
        .from("exchange_orders")
        .select(
          "id,from_asset,to_asset,from_amount,to_amount,status,created_at"
        )
        .order("created_at", {
          ascending: false,
        });

    if (exchangeError) {
      console.error(
        "Admin dashboard exchange error:",
        exchangeError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load exchange information.",
        },
        { status: 500 }
      );
    }

    const exchanges = {
      total: exchangeRows?.length || 0,

      pending:
        exchangeRows?.filter(
          (row) =>
            row.status === "pending" ||
            row.status === "processing"
        ).length || 0,

      completed:
        exchangeRows?.filter(
          (row) =>
            row.status === "completed"
        ).length || 0,

      volume: [] as {
        asset: string;
        amount: number;
      }[],
    };

    const exchangeVolume: Record<
      string,
      number
    > = {};

    for (const order of exchangeRows || []) {
      const amount = Number(
        order.from_amount
      );

      if (!Number.isFinite(amount)) {
        continue;
      }

      exchangeVolume[
        order.from_asset
      ] =
        (exchangeVolume[
          order.from_asset
        ] || 0) + amount;
    }

    exchanges.volume = Object.entries(
      exchangeVolume
    ).map(([asset, amount]) => ({
      asset,
      amount,
    }));

    /*
     * ---------------------------------------------------------
     * WITHDRAWALS
     * ---------------------------------------------------------
     *
     * We use the existing withdrawals table.
     * If the table is unavailable, the dashboard safely
     * reports zero instead of crashing.
     */

    let withdrawalRows: any[] = [];

    const {
      data: withdrawals,
      error: withdrawalsError,
    } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (
      withdrawalsError &&
      !isMissingTableError(
        withdrawalsError
      )
    ) {
      console.error(
        "Admin dashboard withdrawals error:",
        withdrawalsError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load withdrawal information.",
        },
        { status: 500 }
      );
    }

    if (!withdrawalsError) {
      withdrawalRows = withdrawals || [];
    }

    const withdrawalsSummary = {
      total: withdrawalRows.length,

      pending:
        withdrawalRows.filter(
          (row) =>
            row.status === "pending" ||
            row.status === "processing"
        ).length,

      completed:
        withdrawalRows.filter(
          (row) =>
            row.status === "completed"
        ).length,
    };

    /*
     * ---------------------------------------------------------
     * RECENT ACTIVITY
     * ---------------------------------------------------------
     */

    const recentActivity: {
      id: string;
      type: string;
      description: string;
      asset: string | null;
      amount: number | null;
      status: string;
      created_at: string;
    }[] = [];

    /*
     * Recent exchange activity.
     */

    for (
      const order of (exchangeRows || []).slice(
        0,
        10
      )
    ) {
      recentActivity.push({
        id: `exchange-${order.id}`,

        type: "Exchange",

        description:
          `${order.from_asset} → ${order.to_asset}`,

        asset:
          order.from_asset || null,

        amount:
          order.from_amount === null
            ? null
            : Number(
                order.from_amount
              ),

        status:
          order.status || "unknown",

        created_at:
          order.created_at,
      });
    }

    /*
     * Recent revenue activity.
     */

    for (
      const row of (revenueRows || []).slice(
        0,
        10
      )
    ) {
      recentActivity.push({
        id: `revenue-${row.asset}-${row.amount}-${row.status}`,

        type: "Platform Revenue",

        description:
          "HnC platform revenue earned",

        asset:
          row.asset || null,

        amount:
          row.amount === null
            ? null
            : Number(row.amount),

        status:
          row.status || "unknown",

        created_at:
          new Date().toISOString(),
      });
    }

    /*
     * Recent withdrawal activity.
     */

    for (
      const row of withdrawalRows.slice(
        0,
        10
      )
    ) {
      const withdrawalAsset =
        row.asset ||
        row.currency ||
        row.symbol ||
        null;

      const withdrawalAmount =
        row.amount ??
        row.requested_amount ??
        null;

      recentActivity.push({
        id: `withdrawal-${row.id}`,

        type: "Withdrawal",

        description:
          "Withdrawal request",

        asset:
          withdrawalAsset,

        amount:
          withdrawalAmount === null
            ? null
            : Number(
                withdrawalAmount
              ),

        status:
          row.status || "unknown",

        created_at:
          row.created_at,
      });
    }

    /*
     * Sort combined activity by date.
     */

    recentActivity.sort(
      (a, b) =>
        new Date(
          b.created_at
        ).getTime() -
        new Date(
          a.created_at
        ).getTime()
    );

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

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

      data: {
        users: {
          total:
            totalUsers || 0,

          verified:
            verifiedUsers || 0,

          pending:
            Math.max(
              0,
              (totalUsers || 0) -
                (verifiedUsers || 0)
            ),
        },

        treasury:
          (treasury || []).map(
            (item) => ({
              asset:
                item.asset,

              asset_type:
                item.asset_type,

              balance:
                Number(
                  item.balance || 0
                ),

              available_balance:
                Number(
                  item.available_balance ||
                    0
                ),

              locked_balance:
                Number(
                  item.locked_balance ||
                    0
                ),
            })
          ),

        revenue,

        exchanges,

        withdrawals:
          withdrawalsSummary,

        recentActivity:
          recentActivity.slice(
            0,
            20
          ),
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load HnC Admin Dashboard.",
      },
      { status: 500 }
    );
  }
}