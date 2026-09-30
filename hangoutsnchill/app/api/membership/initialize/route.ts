import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error(
    "Missing PAYSTACK_SECRET_KEY environment variable."
  );
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase server environment variables."
  );
}

/*
 * Server-side Supabase client.
 *
 * IMPORTANT:
 * The service role key must NEVER be exposed to the browser.
 */
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type MembershipPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  billing_interval: "monthly" | "yearly" | "one_time";
  price: number;
  currency: string;
  active: boolean;
  paystack_plan_code: string | null;
};

type InitializeRequestBody = {
  planSlug?: string;
};

export async function POST(request: Request) {
  try {
    /*
     * ============================================================
     * 1. AUTHENTICATE THE HnC USER
     * ============================================================
     */

    const authorizationHeader =
      request.headers.get("authorization");

    if (!authorizationHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const token = authorizationHeader.replace(
      /^Bearer\s+/i,
      ""
    );

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication token.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error(
        "Supabase authentication failed:",
        userError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Your session is invalid or has expired.",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user.id;
    const buyerEmail = user.email;

    if (!buyerEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your HnC account does not have an email address.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 2. READ MEMBERSHIP PLAN REQUEST
     * ============================================================
     */

    const body: InitializeRequestBody =
      await request.json();

    const planSlug = body.planSlug?.trim();

    if (!planSlug) {
      return NextResponse.json(
        {
          success: false,
          error: "Membership plan is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 3. LOAD THE AUTHORITATIVE PLAN FROM SUPABASE
     * ============================================================
     *
     * IMPORTANT:
     * The browser does NOT supply the price or Paystack plan code.
     * HnC reads both from the database.
     */

    const {
      data: plan,
      error: planError,
    } = await supabaseAdmin
      .from("membership_plans")
      .select(
        `
          id,
          name,
          slug,
          description,
          billing_interval,
          price,
          currency,
          active,
          paystack_plan_code
        `
      )
      .eq("slug", planSlug)
      .eq("active", true)
      .maybeSingle();

    if (planError) {
      console.error(
        "Unable to load membership plan:",
        planError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to validate the membership plan.",
        },
        {
          status: 500,
        }
      );
    }

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The selected membership plan is unavailable.",
        },
        {
          status: 404,
        }
      );
    }

    const membershipPlan =
      plan as MembershipPlan;

    /*
     * ============================================================
     * 4. VALIDATE PLAN
     * ============================================================
     */

    const amountInNaira =
      Number(membershipPlan.price);

    const planCurrency =
      (
        membershipPlan.currency || "NGN"
      ).toUpperCase();

    if (
      !Number.isFinite(amountInNaira) ||
      amountInNaira <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This membership plan does not have a valid payment amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (planCurrency !== "NGN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "HnC membership currently supports NGN payments only.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Recurring HnC memberships must have a Paystack plan code.
     */
    const paystackPlanCode = membershipPlan.paystack_plan_code;

if (
  membershipPlan.billing_interval === "monthly" &&
  (!paystackPlanCode || !paystackPlanCode.startsWith("PLN_"))
) {
      console.error(
        "Missing Paystack plan code for membership:",
        membershipPlan.slug
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "This membership plan is not yet configured for recurring payments.",
        },
        {
          status: 503,
        }
      );
    }

    /*
     * ============================================================
     * 5. CHECK EXISTING ACTIVE/PENDING SUBSCRIPTION
     * ============================================================
     */

    const {
      data: existingSubscription,
      error: subscriptionCheckError,
    } = await supabaseAdmin
      .from("member_subscriptions")
      .select(
        `
          id,
          plan_id,
          status,
          current_period_end
        `
      )
      .eq("user_id", userId)
      .in("status", [
        "pending",
        "active",
        "past_due",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (subscriptionCheckError) {
      console.error(
        "Unable to check existing membership:",
        subscriptionCheckError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to check your current membership.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a pending or active HnC membership. Please manage your existing membership before starting another one.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ============================================================
     * 6. CREATE HnC TRUST TRANSACTION
     * ============================================================
     */

    const hncTransactionId =
      `HNC-MEM-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${crypto
        .randomUUID()
        .slice(0, 8)
        .toUpperCase()}`;

    const {
      data: hncTransaction,
      error: hncTransactionError,
    } = await supabaseAdmin
      .from("hnc_transactions")
      .insert({
        transaction_id:
          hncTransactionId,
        buyer_id: userId,
        seller_id: null,
        amount: amountInNaira,
        currency: planCurrency,
        payment_provider: "paystack",
        payment_reference: null,
        payment_status: "initiated",
        order_status: "created",
        settlement_status: "pending",
        dispute_status: "none",
        description:
          `${membershipPlan.name} membership subscription`,
        metadata: {
          platform: "HangoutsNChill",
          transaction_type:
            "membership_subscription",
          membership_plan_id:
            membershipPlan.id,
          membership_plan_slug:
            membershipPlan.slug,
          membership_plan_name:
            membershipPlan.name,
          billing_interval:
            membershipPlan.billing_interval,
          paystack_plan_code:
            membershipPlan.paystack_plan_code,
          buyer_email: buyerEmail,
        },
        evidence: {
          checkout_created_at:
            new Date().toISOString(),
        },
        payment_initiated_at:
          new Date().toISOString(),
      })
      .select("id, transaction_id, metadata")
      .single();

    if (
      hncTransactionError ||
      !hncTransaction
    ) {
      console.error(
        "HnC membership Trust transaction creation failed:",
        hncTransactionError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to create the membership payment record.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ============================================================
     * 7. RECORD HnC TRUST EVENT
     * ============================================================
     */

    const {
      error: initialEventError,
    } = await supabaseAdmin
      .from("hnc_transaction_events")
      .insert({
        transaction_id:
          hncTransaction.id,
        event_type:
          "membership_transaction_created",
        previous_status: null,
        new_status: "initiated",
        actor_id: userId,
        description:
          "HnC membership payment transaction created before Paystack initialization.",
        event_data: {
          transaction_id:
            hncTransaction.transaction_id,
          membership_plan_id:
            membershipPlan.id,
          membership_plan_slug:
            membershipPlan.slug,
          paystack_plan_code:
            membershipPlan.paystack_plan_code,
          amount: amountInNaira,
          currency: planCurrency,
        },
      });

    if (initialEventError) {
      console.error(
        "Membership Trust initial event creation failed:",
        initialEventError
      );
    }

    /*
     * ============================================================
     * 8. INITIALIZE PAYSTACK RECURRING SUBSCRIPTION
     * ============================================================
     */

    const amountInKobo =
      Math.round(amountInNaira * 100);

    const payload = {
      email: buyerEmail,
      amount: amountInKobo,
      currency: planCurrency,

      /*
       * THIS IS THE IMPORTANT RECURRING PAYMENT FIELD.
       *
       * Paystack uses the PLN_... plan code to attach the
       * transaction to the recurring membership plan.
       */
      plan: membershipPlan.paystack_plan_code,

      metadata: {
        user_id: userId,
        transaction_type:
          "membership_subscription",
        hnc_transaction_id:
          hncTransaction.transaction_id,
        hnc_transaction_uuid:
          hncTransaction.id,
        membership_plan_id:
          membershipPlan.id,
        membership_plan_slug:
          membershipPlan.slug,
        membership_plan_name:
          membershipPlan.name,
        billing_interval:
          membershipPlan.billing_interval,
        paystack_plan_code:
          membershipPlan.paystack_plan_code,
        platform: "HangoutsNChill",
      },

      callback_url:
        `${
          process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000"
        }/membership/success`,
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    /*
     * ============================================================
     * 9. HANDLE PAYSTACK FAILURE
     * ============================================================
     */

    if (
      !response.ok ||
      !data?.status ||
      !data?.data
    ) {
      console.error(
        "Paystack membership initialization failed:",
        data
      );

      await supabaseAdmin
        .from("hnc_transactions")
        .update({
          payment_status: "failed",
          metadata: {
            ...((hncTransaction as { metadata?: Record<string, unknown> }).metadata ?? {}),
            paystack_initialization_error: {
              message:
                data?.message ??
                "Paystack initialization failed.",
              status: data?.status ?? null,
              http_status: response.status,
            },
          },
        })
        .eq(
          "id",
          hncTransaction.id
        );

      await supabaseAdmin
        .from("hnc_transaction_events")
        .insert({
          transaction_id:
            hncTransaction.id,
          event_type:
            "membership_payment_initialization_failed",
          previous_status: "initiated",
          new_status: "failed",
          actor_id: userId,
          description:
            "Paystack membership payment initialization failed.",
          event_data: {
            paystack_message:
              data?.message ?? null,
            paystack_status:
              data?.status ?? null,
            http_status: response.status,
          },
        });

      return NextResponse.json(
        {
          success: false,
          error:
            data?.message ??
            "Unable to initialize membership payment.",
        },
        {
          status:
            response.status >= 400
              ? response.status
              : 502,
        }
      );
    }

    /*
     * ============================================================
     * 10. SAVE PAYSTACK REFERENCE
     * ============================================================
     */

    const paystackReference =
      data?.data?.reference ?? null;

    const paystackAuthorizationUrl =
      data?.data?.authorization_url ?? null;

    if (!paystackReference || !paystackAuthorizationUrl) {
      console.error(
        "Paystack returned an incomplete membership initialization response:",
        data
      );

      await supabaseAdmin
        .from("hnc_transactions")
        .update({
          payment_status: "failed",
          metadata: {
            ...((hncTransaction as { metadata?: Record<string, unknown> }).metadata ?? {}),
            paystack_initialization_error: {
              message:
                "Paystack did not return a payment reference and authorization URL.",
              status: data?.status ?? null,
              http_status: response.status,
            },
          },
        })
        .eq("id", hncTransaction.id);

      return NextResponse.json(
        {
          success: false,
          error:
            "Paystack returned an incomplete payment initialization response.",
        },
        { status: 502 }
      );
    }

    const existingMetadata =
      ((hncTransaction as { metadata?: Record<string, unknown> })
        .metadata ?? {}) as Record<string, unknown>;

    const {
      error: trustUpdateError,
    } = await supabaseAdmin
      .from("hnc_transactions")
      .update({
        payment_reference:
          paystackReference,
        metadata: {
          ...existingMetadata,
          paystack_access_code:
            data?.data?.access_code ??
            null,
          paystack_authorization_url:
            paystackAuthorizationUrl,
          paystack_subscription_code:
            data?.data?.subscription_code ??
            null,
        },
      })
      .eq(
        "id",
        hncTransaction.id
      );

    if (trustUpdateError) {
      console.error(
        "Membership Trust Paystack reference update failed:",
        trustUpdateError
      );
    }

    /*
     * ============================================================
     * 11. RECORD PAYSTACK INITIALIZATION EVENT
     * ============================================================
     */

    const {
      error:
        paymentInitializedEventError,
    } = await supabaseAdmin
      .from("hnc_transaction_events")
      .insert({
        transaction_id:
          hncTransaction.id,
        event_type:
          "membership_payment_initialized",
        previous_status: "initiated",
        new_status: "initiated",
        actor_id: userId,
        description:
          "Paystack recurring membership payment initialized and linked to HnC Trust.",
        event_data: {
          paystack_reference:
            paystackReference,

          access_code:
            data?.data?.access_code ??
            null,

          authorization_url:
            data?.data?.authorization_url ??
            null,

          subscription_code:
            data?.data?.subscription_code ??
            null,

          membership_plan_id:
            membershipPlan.id,

          membership_plan_slug:
            membershipPlan.slug,

          paystack_plan_code:
            membershipPlan.paystack_plan_code,
        },
      });

    if (
      paymentInitializedEventError
    ) {
      console.error(
        "Membership payment event creation failed:",
        paymentInitializedEventError
      );
    }

    /*
     * ============================================================
     * 12. RETURN PAYSTACK RESPONSE
     * ============================================================
     */

    return NextResponse.json({
      success: true,
      ...data,

      hnc_transaction_id:
        hncTransaction.transaction_id,

      membership_plan: {
        id: membershipPlan.id,
        name: membershipPlan.name,
        slug: membershipPlan.slug,
        billing_interval:
          membershipPlan.billing_interval,
        price: amountInNaira,
        currency: planCurrency,
        paystack_plan_code:
          membershipPlan.paystack_plan_code,
      },
    });
  } catch (error) {
    console.error(
      "Membership payment initialization error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error.",
      },
      {
        status: 500,
      }
    );
  }
}