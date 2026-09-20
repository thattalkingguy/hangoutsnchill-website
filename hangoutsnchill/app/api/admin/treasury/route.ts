import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    /*
     * ============================================================
     * AUTHENTICATION
     * ============================================================
     */

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    /*
     * ============================================================
     * ADMIN AUTHORIZATION
     * ============================================================
     *
     * The logged-in Supabase user must have:
     *
     * role = admin
     *
     * in public.profiles.
     */

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role, verified")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Admin profile lookup failed:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify administrator access.",
        },
        { status: 500 }
      );
    }

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    /*
     * ============================================================
     * TREASURY BALANCES
     * ============================================================
     */

    const {
      data: treasury,
      error: treasuryError,
    } = await supabaseAdmin
      .from("platform_treasury")
      .select(
        "asset,asset_type,balance,available_balance,locked_balance"
      )
      .order("asset");

    if (treasuryError) {
      console.error(
        "Treasury lookup failed:",
        treasuryError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load treasury balances.",
        },
        { status: 500 }
      );
    }

    /*
     * ============================================================
     * PLATFORM REVENUE
     * ============================================================
     */

    const {
      data: revenue,
      error: revenueError,
    } = await supabaseAdmin
      .from("platform_revenue")
      .select(
        "id,revenue_type,asset,asset_type,amount,source,reference,description,status,created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(100);

    if (revenueError) {
      console.error(
        "Revenue lookup failed:",
        revenueError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load platform revenue.",
        },
        { status: 500 }
      );
    }

    /*
     * ============================================================
     * TREASURY TRANSACTIONS
     * ============================================================
     */

    const {
      data: transactions,
      error: transactionError,
    } = await supabaseAdmin
      .from("platform_treasury_transactions")
      .select(
        "id,transaction_type,asset,asset_type,amount,balance_before,balance_after,reference,description,status,provider,provider_reference,created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(100);

    if (transactionError) {
      console.error(
        "Treasury transaction lookup failed:",
        transactionError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load treasury activity.",
        },
        { status: 500 }
      );
    }

    /*
     * ============================================================
     * RETURN DATA
     * ============================================================
     */

    return NextResponse.json({
      success: true,

      admin: {
        id: user.id,
        fullName: profile.full_name,
        role: profile.role,
        verified: profile.verified,
      },

      treasury: treasury || [],

      revenue: revenue || [],

      transactions: transactions || [],
    });
  } catch (error) {
    console.error(
      "Admin treasury API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load HnC Treasury.",
      },
      { status: 500 }
    );
  }
}