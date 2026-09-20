import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken = authorization.substring("Bearer ".length).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = getAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("credit_profiles")
        .select(
          `
          user_id,
          qualifying_activity_usd,
          minimum_activity_usd,
          kyc_status,
          bvn_status,
          credit_check_status,
          affordability_status,
          eligibility_status,
          eligibility_reason,
          last_credit_check_at,
          created_at,
          updated_at
        `
        )
        .eq("user_id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error("Credit profile error:", profileError);

      return NextResponse.json(
        {
          error: "Unable to load HnC CREDIT profile.",
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: {
          user_id: user.id,
          qualifying_activity_usd: 0,
          minimum_activity_usd: 20,
          kyc_status: "pending",
          bvn_status: "pending",
          credit_check_status: "pending",
          affordability_status: "pending",
          eligibility_status: "ineligible",
          eligibility_reason:
            "HnC CREDIT profile has not been created yet.",
          last_credit_check_at: null,
        },
        loan: null,
      });
    }

    const { data: activeLoan, error: loanError } =
      await supabaseAdmin
        .from("credit_loans")
        .select(
          `
          id,
          application_reference,
          requested_amount,
          approved_amount,
          principal_amount,
          interest_amount,
          fee_amount,
          total_repayment_amount,
          amount_paid,
          outstanding_amount,
          currency,
          status,
          purpose,
          applied_at,
          approved_at,
          disbursed_at,
          due_at
        `
        )
        .eq("user_id", user.id)
        .in("status", [
          "approved",
          "active",
          "partially_paid",
          "overdue",
          "defaulted",
        ])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (loanError) {
      console.error("Credit loan error:", loanError);

      return NextResponse.json(
        {
          error: "Unable to load HnC CREDIT loan status.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,

      profile: {
        user_id: profile.user_id,

        qualifying_activity_usd: Number(
          profile.qualifying_activity_usd || 0
        ),

        minimum_activity_usd: Number(
          profile.minimum_activity_usd || 20
        ),

        kyc_status: profile.kyc_status,
        bvn_status: profile.bvn_status,
        credit_check_status: profile.credit_check_status,
        affordability_status: profile.affordability_status,

        eligibility_status: profile.eligibility_status,
        eligibility_reason: profile.eligibility_reason,

        last_credit_check_at:
          profile.last_credit_check_at,

        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },

      loan: activeLoan
        ? {
            id: activeLoan.id,

            application_reference:
              activeLoan.application_reference,

            requested_amount:
              Number(activeLoan.requested_amount || 0),

            approved_amount:
              Number(activeLoan.approved_amount || 0),

            principal_amount:
              Number(activeLoan.principal_amount || 0),

            interest_amount:
              Number(activeLoan.interest_amount || 0),

            fee_amount:
              Number(activeLoan.fee_amount || 0),

            total_repayment_amount:
              Number(
                activeLoan.total_repayment_amount || 0
              ),

            amount_paid:
              Number(activeLoan.amount_paid || 0),

            outstanding_amount:
              Number(activeLoan.outstanding_amount || 0),

            currency: activeLoan.currency,
            status: activeLoan.status,
            purpose: activeLoan.purpose,

            applied_at: activeLoan.applied_at,
            approved_at: activeLoan.approved_at,
            disbursed_at: activeLoan.disbursed_at,
            due_at: activeLoan.due_at,
          }
        : null,
    });
  } catch (error) {
    console.error("HnC CREDIT status API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}