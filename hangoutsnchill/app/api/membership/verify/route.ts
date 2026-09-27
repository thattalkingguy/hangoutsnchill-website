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

type VerifyRequestBody = {
  reference?: string;
};

type PaystackSubscription = {
  status?: string;
  subscription_code?: string;
  email_token?: string;
  next_payment_date?: string;
  start?: number;
  amount?: number;
  customer?: {
    customer_code?: string;
    email?: string;
  };
};

type PaystackVerifyResponse = {
  status?: boolean;
  message?: string;
  data?: {
    id?: number;
    status?: string;
    reference?: string;
    amount?: number;
    requested_amount?: number;
    currency?: string;
    paidAt?: string;
    createdAt?: string;
    metadata?: Record<string, unknown> | null;
    customer?: {
      id?: number;
      customer_code?: string;
      email?: string;
    };
    authorization?: {
      authorization_code?: string;
      reusable?: boolean;
      channel?: string;
      card_type?: string;
      last4?: string;
      exp_month?: string;
      exp_year?: string;
    };
    plan?: unknown;
    plan_object?: unknown;
  };
};

type PaystackSubscriptionResponse = {
  status?: boolean;
  message?: string;
  data?: PaystackSubscription;
};

function jsonError(
  message: string,
  status: number,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...extra,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request) {
  try {
    /*
     * ============================================================
     * 1. READ PAYMENT REFERENCE
     * ============================================================
     */

    const body: VerifyRequestBody = await request.json();

    const reference = body.reference?.trim();

    if (!reference) {
      return jsonError(
        "Paystack payment reference is required.",
        400
      );
    }

    /*
     * ============================================================
     * 2. AUTHENTICATE HnC USER
     * ============================================================
     */

    const authorizationHeader =
      request.headers.get("authorization");

    if (!authorizationHeader) {
      return jsonError(
        "Authentication required.",
        401
      );
    }

    const token = authorizationHeader.replace(
      /^Bearer\s+/i,
      ""
    );

    if (!token) {
      return jsonError(
        "Invalid authentication token.",
        401
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error(
        "Membership verification authentication failed:",
        userError
      );

      return jsonError(
        "Your session is invalid or has expired.",
        401
      );
    }

    const userId = user.id;

    /*
     * ============================================================
     * 3. VERIFY TRANSACTION DIRECTLY WITH PAYSTACK
     * ============================================================
     *
     * Webhooks will later provide the automatic lifecycle.
     * This endpoint gives the customer a safe post-checkout
     * verification path.
     */

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const paystackData =
      (await paystackResponse.json()) as PaystackVerifyResponse;

    if (
      !paystackResponse.ok ||
      !paystackData.status ||
      !paystackData.data
    ) {
      console.error(
        "Paystack membership verification failed:",
        paystackData
      );

      return jsonError(
        "Unable to verify this payment with Paystack.",
        502
      );
    }

    const payment = paystackData.data;

    /*
     * ============================================================
     * 4. CONFIRM PAYMENT STATUS
     * ============================================================
     */

    if (payment.status !== "success") {
      return jsonError(
        `Payment has not completed successfully. Current Paystack status: ${
          payment.status ?? "unknown"
        }.`,
        400,
        {
          payment_status: payment.status ?? null,
          reference,
        }
      );
    }

    /*
     * ============================================================
     * 5. LOCATE HnC TRUST TRANSACTION
     * ============================================================
     */

    const {
      data: hncTransaction,
      error: transactionLookupError,
    } = await supabaseAdmin
      .from("hnc_transactions")
      .select(
        `
          id,
          transaction_id,
          buyer_id,
          amount,
          currency,
          payment_reference,
          payment_status,
          order_status,
          metadata,
          evidence
        `
      )
      .eq("payment_reference", reference)
      .maybeSingle();

    if (transactionLookupError) {
      console.error(
        "Membership HnC Trust transaction lookup failed:",
        transactionLookupError
      );

      return jsonError(
        "Unable to locate the HnC membership payment record.",
        500
      );
    }

    if (!hncTransaction) {
      return jsonError(
        "This payment reference is not linked to an HnC membership transaction.",
        404
      );
    }

    /*
     * ============================================================
     * 6. SECURITY — PAYMENT MUST BELONG TO CURRENT USER
     * ============================================================
     */

    if (hncTransaction.buyer_id !== userId) {
      console.error(
        "Membership payment ownership mismatch:",
        {
          transactionId:
            hncTransaction.transaction_id,
          transactionBuyer:
            hncTransaction.buyer_id,
          authenticatedUser:
            userId,
        }
      );

      return jsonError(
        "This membership payment does not belong to your HnC account.",
        403
      );
    }

    /*
     * ============================================================
     * 7. READ MEMBERSHIP METADATA
     * ============================================================
     */

    const metadata =
      (hncTransaction.metadata ?? {}) as Record<
        string,
        unknown
      >;

    const membershipPlanId =
      typeof metadata.membership_plan_id === "string"
        ? metadata.membership_plan_id
        : null;

    const membershipPlanSlug =
      typeof metadata.membership_plan_slug === "string"
        ? metadata.membership_plan_slug
        : null;

    const transactionType =
      typeof metadata.transaction_type === "string"
        ? metadata.transaction_type
        : null;

    if (
      transactionType !==
      "membership_subscription"
    ) {
      return jsonError(
        "This payment is not an HnC membership subscription transaction.",
        400
      );
    }

    if (!membershipPlanId) {
      return jsonError(
        "The membership plan could not be identified from the HnC transaction.",
        500
      );
    }

    /*
     * ============================================================
     * 8. LOAD AUTHORITATIVE MEMBERSHIP PLAN
     * ============================================================
     */

    const {
      data: membershipPlan,
      error: membershipPlanError,
    } = await supabaseAdmin
      .from("membership_plans")
      .select(
        `
          id,
          name,
          slug,
          billing_interval,
          price,
          currency,
          active,
          paystack_plan_code
        `
      )
      .eq("id", membershipPlanId)
      .maybeSingle();

    if (membershipPlanError) {
      console.error(
        "Membership plan lookup failed:",
        membershipPlanError
      );

      return jsonError(
        "Unable to load the membership plan.",
        500
      );
    }

    if (!membershipPlan) {
      return jsonError(
        "The membership plan associated with this payment no longer exists.",
        404
      );
    }

    /*
     * ============================================================
     * 9. CONFIRM PLAN IDENTITY
     * ============================================================
     */

    if (
      membershipPlanSlug &&
      membershipPlan.slug !== membershipPlanSlug
    ) {
      return jsonError(
        "The membership payment contains an invalid plan configuration.",
        400
      );
    }

    if (
      membershipPlan.billing_interval !==
      "monthly"
    ) {
      return jsonError(
        "This membership plan is not configured as a monthly subscription.",
        400
      );
    }

    if (
      !membershipPlan.paystack_plan_code ||
      !membershipPlan.paystack_plan_code.startsWith(
        "PLN_"
      )
    ) {
      return jsonError(
        "This membership plan has an invalid Paystack plan configuration.",
        503
      );
    }

    /*
     * ============================================================
     * 10. VERIFY AMOUNT
     * ============================================================
     *
     * Paystack's plan controls the recurring amount, but HnC
     * still checks the verified transaction against the
     * authoritative HnC plan price.
     */

    const expectedAmountKobo =
      Math.round(
        Number(membershipPlan.price) * 100
      );

    const paidAmountKobo =
      Number(payment.amount ?? 0);

    if (
      expectedAmountKobo <= 0 ||
      paidAmountKobo !== expectedAmountKobo
    ) {
      console.error(
        "Membership amount mismatch:",
        {
          expectedAmountKobo,
          paidAmountKobo,
          reference,
          plan:
            membershipPlan.slug,
        }
      );

      return jsonError(
        "The verified payment amount does not match the HnC membership plan.",
        400,
        {
          reference,
          expected_amount: expectedAmountKobo,
          paid_amount: paidAmountKobo,
        }
      );
    }

    /*
     * ============================================================
     * 11. VERIFY CURRENCY
     * ============================================================
     */

    const expectedCurrency =
      String(
        membershipPlan.currency ?? "NGN"
      ).toUpperCase();

    const paidCurrency =
      String(
        payment.currency ?? ""
      ).toUpperCase();

    if (
      expectedCurrency !== paidCurrency
    ) {
      return jsonError(
        "The payment currency does not match the HnC membership plan.",
        400,
        {
          expected_currency:
            expectedCurrency,
          paid_currency:
            paidCurrency,
        }
      );
    }

    /*
     * ============================================================
     * 12. IDEMPOTENCY CHECK
     * ============================================================
     *
     * If verification is called more than once, never create
     * multiple active memberships for the same payment.
     */

    const {
      data: existingSubscription,
      error: existingSubscriptionError,
    } = await supabaseAdmin
      .from("member_subscriptions")
      .select(
        `
          id,
          user_id,
          plan_id,
          status,
          paystack_reference,
          hnc_transaction_id,
          started_at,
          current_period_start,
          current_period_end
        `
      )
      .eq(
        "hnc_transaction_id",
        hncTransaction.id
      )
      .maybeSingle();

    if (existingSubscriptionError) {
      console.error(
        "Membership existing subscription lookup failed:",
        existingSubscriptionError
      );

      return jsonError(
        "Unable to check existing membership activation.",
        500
      );
    }

    if (existingSubscription) {
      return NextResponse.json({
        success: true,
        already_active: true,
        message:
          "This HnC membership payment has already been verified.",
        membership: existingSubscription,
      });
    }

    /*
     * ============================================================
     * 13. CHECK FOR ANOTHER ACTIVE MEMBERSHIP
     * ============================================================
     */

    const {
      data: activeMembership,
      error: activeMembershipError,
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
        "active",
        "past_due",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (activeMembershipError) {
      console.error(
        "Membership active subscription check failed:",
        activeMembershipError
      );

      return jsonError(
        "Unable to check your current HnC membership.",
        500
      );
    }

    if (activeMembership) {
      return jsonError(
        "Your HnC account already has an active membership.",
        409,
        {
          membership:
            activeMembership,
        }
      );
    }

    /*
     * ============================================================
     * 14. READ PAYSTACK SUBSCRIPTION IDENTIFIER
     * ============================================================
     *
     * The initialize route stores the subscription code inside
     * the HnC Trust evidence record.
     */

    const evidence =
      (hncTransaction.evidence ?? {}) as Record<
        string,
        unknown
      >;

    let paystackSubscriptionCode =
      typeof evidence.paystack_subscription_code ===
      "string"
        ? evidence.paystack_subscription_code
        : null;

    /*
     * If the initialization response did not expose the
     * subscription code yet, use the Paystack customer's
     * subscriptions as a controlled fallback.
     */

    const paystackCustomerCode =
      payment.customer?.customer_code ??
      null;

    let paystackSubscription:
      PaystackSubscription | null = null;

    if (paystackSubscriptionCode) {
      const subscriptionResponse =
        await fetch(
          `https://api.paystack.co/subscription/${encodeURIComponent(
            paystackSubscriptionCode
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

      const subscriptionData =
        (await subscriptionResponse.json()) as PaystackSubscriptionResponse;

      if (
        subscriptionResponse.ok &&
        subscriptionData.status &&
        subscriptionData.data
      ) {
        paystackSubscription =
          subscriptionData.data;
      }
    }

    /*
     * If no subscription code was saved by initialization,
     * search Paystack's customer subscriptions.
     */

    if (
      !paystackSubscriptionCode &&
      paystackCustomerCode
    ) {
      const customerResponse =
        await fetch(
          `https://api.paystack.co/subscription?customer=${encodeURIComponent(
            paystackCustomerCode
          )}&perPage=50`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

      const customerSubscriptionData =
        (await customerResponse.json()) as {
          status?: boolean;
          data?: PaystackSubscription[];
        };

      if (
        customerResponse.ok &&
        customerSubscriptionData.status &&
        Array.isArray(
          customerSubscriptionData.data
        )
      ) {
        const matchingSubscription =
          customerSubscriptionData.data.find(
            (subscription) =>
              subscription.status ===
                "active" ||
              subscription.status ===
                "non-renewing" ||
              subscription.status ===
                "attention"
          );

        if (matchingSubscription) {
          paystackSubscription =
            matchingSubscription;

          paystackSubscriptionCode =
            matchingSubscription.subscription_code ??
            null;
        }
      }
    }

    /*
     * ============================================================
     * 15. REQUIRE PAYSTACK SUBSCRIPTION
     * ============================================================
     */

    if (!paystackSubscriptionCode) {
      console.error(
        "Membership payment succeeded but no Paystack subscription code was found.",
        {
          reference,
          hncTransaction:
            hncTransaction.transaction_id,
          customer:
            paystackCustomerCode,
        }
      );

      return jsonError(
        "Payment was successful, but HnC could not confirm the recurring subscription yet. Please do not pay again.",
        409,
        {
          reference,
          payment_verified: true,
          subscription_confirmed: false,
        }
      );
    }

    /*
     * ============================================================
     * 16. FETCH SUBSCRIPTION IF NEEDED
     * ============================================================
     */

    if (!paystackSubscription) {
      const subscriptionResponse =
        await fetch(
          `https://api.paystack.co/subscription/${encodeURIComponent(
            paystackSubscriptionCode
          )}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

      const subscriptionData =
        (await subscriptionResponse.json()) as PaystackSubscriptionResponse;

      if (
        subscriptionResponse.ok &&
        subscriptionData.status &&
        subscriptionData.data
      ) {
        paystackSubscription =
          subscriptionData.data;
      }
    }

    /*
     * ============================================================
     * 17. CONFIRM PAYSTACK SUBSCRIPTION STATUS
     * ============================================================
     */

    const paystackSubscriptionStatus =
      paystackSubscription?.status ??
      "active";

    const allowedSubscriptionStatuses = [
      "active",
      "non-renewing",
      "attention",
    ];

    if (
      !allowedSubscriptionStatuses.includes(
        paystackSubscriptionStatus
      )
    ) {
      console.error(
        "Unexpected Paystack subscription status:",
        {
          status:
            paystackSubscriptionStatus,
          reference,
          subscription:
            paystackSubscriptionCode,
        }
      );

      return jsonError(
        "The Paystack subscription is not currently active.",
        409,
        {
          payment_verified: true,
          subscription_confirmed: false,
          paystack_subscription_status:
            paystackSubscriptionStatus,
        }
      );
    }

    /*
     * ============================================================
     * 18. CALCULATE MEMBERSHIP PERIOD
     * ============================================================
     *
     * Paystack supplies the next payment date on the subscription.
     * HnC uses that date as the authoritative end of the current
     * paid membership period.
     */

    const startedAt =
      payment.paidAt ??
      new Date().toISOString();

    const currentPeriodStart =
      startedAt;

    const currentPeriodEnd =
      paystackSubscription?.next_payment_date ??
      null;

    if (!currentPeriodEnd) {
      console.error(
        "Paystack subscription did not provide a next payment date:",
        {
          reference,
          subscription:
            paystackSubscriptionCode,
        }
      );

      return jsonError(
        "Payment was successful, but HnC could not determine the subscription renewal date yet. Please do not pay again.",
        409,
        {
          payment_verified: true,
          subscription_confirmed: true,
          paystack_subscription_code:
            paystackSubscriptionCode,
        }
      );
    }

    /*
     * ============================================================
     * 19. CREATE HnC MEMBERSHIP SUBSCRIPTION
     * ============================================================
     */

    const {
      data: createdSubscription,
      error: createSubscriptionError,
    } = await supabaseAdmin
      .from("member_subscriptions")
      .insert({
        user_id: userId,
        plan_id: membershipPlan.id,
        status: "active",
        paystack_reference:
          reference,
        hnc_transaction_id:
          hncTransaction.id,
        paystack_subscription_code:
          paystackSubscriptionCode,
        paystack_email_token:
          paystackSubscription?.email_token ??
          null,
        paystack_customer_code:
          paystackCustomerCode ??
          paystackSubscription?.customer
            ?.customer_code ??
          null,
        started_at:
          startedAt,
        current_period_start:
          currentPeriodStart,
        current_period_end:
          currentPeriodEnd,
      })
      .select(
        `
          id,
          user_id,
          plan_id,
          status,
          paystack_reference,
          hnc_transaction_id,
          paystack_subscription_code,
          paystack_customer_code,
          started_at,
          current_period_start,
          current_period_end
        `
      )
      .single();

    if (
      createSubscriptionError ||
      !createdSubscription
    ) {
      console.error(
        "HnC membership subscription creation failed:",
        createSubscriptionError
      );

      return jsonError(
        "Payment was verified, but HnC could not activate the membership record. Please do not pay again.",
        500,
        {
          payment_verified: true,
          reference,
        }
      );
    }

    /*
     * ============================================================
     * 20. UPDATE HnC TRUST TRANSACTION
     * ============================================================
     */

    const {
      error: trustUpdateError,
    } = await supabaseAdmin
      .from("hnc_transactions")
      .update({
        payment_reference:
          reference,
        payment_status:
          "paid",
        order_status:
          "completed",
        payment_verified_at:
          payment.paidAt ??
          new Date().toISOString(),
        metadata: {
          ...metadata,
          membership_subscription_id:
            createdSubscription.id,
          paystack_customer_code:
            paystackCustomerCode,
          paystack_subscription_code:
            paystackSubscriptionCode,
          paystack_subscription_status:
            paystackSubscriptionStatus,
        },
        evidence: {
          ...evidence,
          paystack_transaction_id:
            payment.id ?? null,
          paystack_paid_at:
            payment.paidAt ?? null,
          paystack_authorization_code:
            payment.authorization
              ?.authorization_code ??
            null,
          paystack_subscription_code:
            paystackSubscriptionCode,
          paystack_email_token:
            paystackSubscription
              ?.email_token ??
            null,
          paystack_customer_code:
            paystackCustomerCode,
          paystack_subscription_status:
            paystackSubscriptionStatus,
          paystack_next_payment_date:
            currentPeriodEnd,
          membership_subscription_id:
            createdSubscription.id,
          verified_at:
            new Date().toISOString(),
        },
      })
      .eq(
        "id",
        hncTransaction.id
      );

    if (trustUpdateError) {
      console.error(
        "HnC Trust membership transaction update failed:",
        trustUpdateError
      );
    }

    /*
     * ============================================================
     * 21. RECORD HnC TRUST EVENT
     * ============================================================
     */

    const {
      error: verificationEventError,
    } = await supabaseAdmin
      .from("hnc_transaction_events")
      .insert({
        transaction_id:
          hncTransaction.id,
        event_type:
          "membership_payment_verified",
        previous_status:
          hncTransaction.payment_status,
        new_status:
          "paid",
        actor_id:
          userId,
        description:
          "HnC membership payment verified with Paystack and membership activated.",
        event_data: {
          paystack_reference:
            reference,
          paystack_transaction_id:
            payment.id ??
            null,
          membership_plan_id:
            membershipPlan.id,
          membership_plan_slug:
            membershipPlan.slug,
          membership_subscription_id:
            createdSubscription.id,
          paystack_subscription_code:
            paystackSubscriptionCode,
          paystack_subscription_status:
            paystackSubscriptionStatus,
          current_period_start:
            currentPeriodStart,
          current_period_end:
            currentPeriodEnd,
        },
      });

    if (verificationEventError) {
      console.error(
        "Membership verification event creation failed:",
        verificationEventError
      );
    }

    /*
     * ============================================================
     * 22. RETURN SUCCESS
     * ============================================================
     */

    return NextResponse.json({
      success: true,
      message:
        "HnC membership payment verified and membership activated.",
      payment: {
        reference,
        status:
          payment.status,
        amount:
          paidAmountKobo,
        currency:
          paidCurrency,
        paid_at:
          payment.paidAt ??
          null,
      },
      membership: {
        id:
          createdSubscription.id,
        plan_id:
          membershipPlan.id,
        plan_name:
          membershipPlan.name,
        plan_slug:
          membershipPlan.slug,
        status:
          createdSubscription.status,
        started_at:
          createdSubscription.started_at,
        current_period_start:
          createdSubscription.current_period_start,
        current_period_end:
          createdSubscription.current_period_end,
        paystack_subscription_code:
          createdSubscription.paystack_subscription_code,
      },
    });
  } catch (error) {
    console.error(
      "HnC membership verification error:",
      error
    );

    return jsonError(
      "Internal Server Error.",
      500
    );
  }
}