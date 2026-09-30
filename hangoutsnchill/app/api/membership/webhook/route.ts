import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  notifyMember,
  createAdminAlert,
} from "@/lib/hncOperations";

export const runtime = "nodejs";

type PaystackWebhookPayload = {
  event?: string;
  data?: any;
};

function getPaystackSecret(): string {
  return process.env.PAYSTACK_SECRET_KEY || "";
}

function verifyPaystackSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = getPaystackSecret();

  if (!secret || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    signatureBuffer
  );
}

function parseDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getSubscriptionCode(data: any): string | null {
  return (
    data?.subscription_code ||
    data?.subscription?.subscription_code ||
    data?.subscription?.code ||
    null
  );
}

function getCustomerCode(data: any): string | null {
  return (
    data?.customer?.customer_code ||
    data?.customer_code ||
    null
  );
}

function getEmailToken(data: any): string | null {
  return (
    data?.subscription?.email_token ||
    data?.email_token ||
    null
  );
}

function getReference(data: any): string | null {
  return (
    data?.reference ||
    data?.transaction_reference ||
    data?.invoice?.transaction_reference ||
    data?.invoice?.reference ||
    null
  );
}

function getPlanCode(data: any): string | null {
  return (
    data?.plan?.plan_code ||
    data?.plan?.plan_code ||
    data?.subscription?.plan?.plan_code ||
    data?.subscription?.plan_code ||
    null
  );
}

async function findMembershipSubscription(data: any) {
  const subscriptionCode = getSubscriptionCode(data);
  const customerCode = getCustomerCode(data);
  const reference = getReference(data);

  if (subscriptionCode) {
    const { data: subscription, error } = await supabaseAdmin
      .from("member_subscriptions")
      .select("*")
      .eq("paystack_subscription_code", subscriptionCode)
      .maybeSingle();

    if (error) {
      console.error(
        "Membership subscription lookup by subscription code failed:",
        error
      );
    }

    if (subscription) {
      return subscription;
    }
  }

  if (reference) {
    const { data: subscription, error } = await supabaseAdmin
      .from("member_subscriptions")
      .select("*")
      .eq("paystack_reference", reference)
      .maybeSingle();

    if (error) {
      console.error(
        "Membership subscription lookup by reference failed:",
        error
      );
    }

    if (subscription) {
      return subscription;
    }

    const { data: transaction, error: transactionError } =
      await supabaseAdmin
        .from("hnc_transactions")
        .select("id, buyer_id, payment_reference, metadata")
        .eq("payment_reference", reference)
        .maybeSingle();

    if (transactionError) {
      console.error(
        "HnC transaction lookup by reference failed:",
        transactionError
      );
    }

    if (transaction) {
      const { data: membership, error: membershipError } =
        await supabaseAdmin
          .from("member_subscriptions")
          .select("*")
          .eq("hnc_transaction_id", transaction.id)
          .maybeSingle();

      if (membershipError) {
        console.error(
          "Membership lookup by HnC transaction failed:",
          membershipError
        );
      }

      if (membership) {
        return membership;
      }
    }
  }

  /*
   * Customer code is NOT unique enough to blindly select the latest
   * membership. A Paystack customer can have more than one historical
   * or concurrent subscription.
   *
   * Only use this fallback when it resolves to exactly one HnC
   * membership, and when an event plan code (if present) agrees with
   * that membership's authoritative HnC plan.
   */
  if (customerCode) {
    const { data: customerMemberships, error } =
      await supabaseAdmin
        .from("member_subscriptions")
        .select("*")
        .eq("paystack_customer_code", customerCode)
        .order("created_at", { ascending: false })
        .limit(2);

    if (error) {
      console.error(
        "Membership subscription lookup by customer code failed:",
        error
      );
      return null;
    }

    if (customerMemberships?.length === 1) {
      const candidate = customerMemberships[0];
      const eventPlanCode = getPlanCode(data);

      if (eventPlanCode) {
        const { data: plan, error: planError } =
          await supabaseAdmin
            .from("membership_plans")
            .select("paystack_plan_code")
            .eq("id", candidate.plan_id)
            .maybeSingle();

        if (planError) {
          console.error(
            "Membership plan lookup for customer fallback failed:",
            planError
          );
          return null;
        }

        if (
          !plan?.paystack_plan_code ||
          plan.paystack_plan_code !== eventPlanCode
        ) {
          console.warn(
            "Rejected customer-code membership fallback because Paystack plan does not match the HnC membership plan."
          );
          return null;
        }
      }

      return candidate;
    }

    if (customerMemberships && customerMemberships.length > 1) {
      console.warn(
        "Rejected customer-code membership fallback because multiple HnC memberships match the Paystack customer."
      );
    }
  }

  return null;
}

async function findHncTransaction(data: any) {
  const reference = getReference(data);

  if (!reference) {
    return null;
  }

  const { data: transaction, error } = await supabaseAdmin
    .from("hnc_transactions")
    .select("id, buyer_id, payment_reference, transaction_id, metadata")
    .eq("payment_reference", reference)
    .maybeSingle();

  if (error) {
    console.error(
      "HnC transaction lookup failed:",
      error
    );
    return null;
  }

  return transaction;
}

async function recordWebhookEvent(
  transactionId: string | null,
  event: string,
  data: any,
  result?: Record<string, any>
) {
  if (!transactionId) {
    return;
  }

  try {
    await supabaseAdmin
      .from("hnc_transaction_events")
      .insert({
        transaction_id: transactionId,
        event_type: `paystack_${event}`,
        previous_status: null,
        new_status: null,
        description: `Paystack membership webhook received: ${event}.`,
        event_data: {
          event,
          reference: getReference(data),
          subscription_code: getSubscriptionCode(data),
          customer_code: getCustomerCode(data),
          plan_code: getPlanCode(data),
          email_token: getEmailToken(data),
          result: result || null,
          received_at: new Date().toISOString(),
        },
      });
  } catch (error) {
    console.error(
      "Failed to record Paystack webhook event:",
      error
    );
  }
}

async function updateHncTransactionFromWebhook(
  data: any,
  event: string,
  subscriptionCode?: string | null
) {
  const reference = getReference(data);

  if (!reference) {
    return null;
  }

  const { data: transaction, error: lookupError } =
    await supabaseAdmin
      .from("hnc_transactions")
      .select("id, buyer_id, transaction_id, metadata")
      .eq("payment_reference", reference)
      .maybeSingle();

  if (lookupError) {
    console.error(
      "HnC transaction webhook lookup failed:",
      lookupError
    );
    return null;
  }

  if (!transaction) {
    return null;
  }

  const existingMetadata =
    transaction.metadata &&
    typeof transaction.metadata === "object" &&
    !Array.isArray(transaction.metadata)
      ? transaction.metadata
      : {};

  const customerCode = getCustomerCode(data);
  const emailToken = getEmailToken(data);
  const planCode = getPlanCode(data);

  const webhookHistory = Array.isArray(
    (existingMetadata as Record<string, unknown>)
      .paystack_webhook_history
  )
    ? [
        ...((existingMetadata as Record<string, unknown>)
          .paystack_webhook_history as unknown[]),
      ]
    : [];

  webhookHistory.push({
    event,
    received_at: new Date().toISOString(),
    reference,
    subscription_code: subscriptionCode || null,
    customer_code: customerCode || null,
    email_token: emailToken || null,
    plan_code: planCode || null,
  });

  const nextMetadata: Record<string, unknown> = {
    ...existingMetadata,
    last_paystack_webhook_event: event,
    last_paystack_webhook_at: new Date().toISOString(),
    paystack_webhook_history: webhookHistory.slice(-20),
  };

  if (subscriptionCode) {
    nextMetadata.paystack_subscription_code =
      subscriptionCode;
  }

  if (customerCode) {
    nextMetadata.paystack_customer_code =
      customerCode;
  }

  if (emailToken) {
    nextMetadata.paystack_email_token =
      emailToken;
  }

  if (planCode) {
    nextMetadata.paystack_webhook_plan_code =
      planCode;
  }

  const { error } = await supabaseAdmin
    .from("hnc_transactions")
    .update({
      metadata: nextMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.id);

  if (error) {
    console.error(
      "HnC transaction webhook metadata update failed:",
      error
    );
  }

  return transaction;
}

async function handleSubscriptionCreate(data: any) {
  const subscriptionCode = getSubscriptionCode(data);
  const customerCode = getCustomerCode(data);
  const emailToken = getEmailToken(data);

  /*
   * Important:
   * subscription.create can arrive before HnC has created
   * member_subscriptions.
   *
   * Always preserve the Paystack subscription information
   * first when the webhook contains a usable reference.
   */
  const transaction = await updateHncTransactionFromWebhook(
    data,
    "subscription.create",
    subscriptionCode
  );

  await recordWebhookEvent(
    transaction?.id || null,
    "subscription.create",
    data
  );

  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
      deferred: true,
      reason:
        "Subscription received and preserved, but HnC membership record does not exist yet.",
      subscription_code: subscriptionCode,
      customer_code: customerCode,
    };
  }

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (subscriptionCode) {
    updatePayload.paystack_subscription_code =
      subscriptionCode;
  }

  if (customerCode) {
    updatePayload.paystack_customer_code =
      customerCode;
  }

  if (emailToken) {
    updatePayload.paystack_email_token =
      emailToken;
  }

  const { error } = await supabaseAdmin
    .from("member_subscriptions")
    .update(updatePayload)
    .eq("id", membership.id);

  if (error) {
    throw new Error(
      `Failed to update membership from subscription.create: ${error.message}`
    );
  }

  return {
    handled: true,
    membership_id: membership.id,
    status: membership.status,
    subscription_code: subscriptionCode,
  };
}

async function handleChargeSuccess(data: any) {
  const subscriptionCode = getSubscriptionCode(data);

  /*
   * Preserve the successful Paystack event even if the
   * membership row is not available yet.
   */
  const transaction = await updateHncTransactionFromWebhook(
    data,
    "charge.success",
    subscriptionCode
  );

  await recordWebhookEvent(
    transaction?.id || null,
    "charge.success",
    data
  );

  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
      deferred: true,
      reason:
        "Successful Paystack charge received, but HnC membership record does not exist yet.",
      subscription_code: subscriptionCode,
    };
  }

  const customerCode = getCustomerCode(data);
  const emailToken = getEmailToken(data);

  const periodStart =
    parseDate(
      data?.period_start ||
        data?.subscription?.period_start ||
        data?.subscription?.start_date
    ) ||
    membership.current_period_start ||
    new Date().toISOString();

  const periodEnd =
    parseDate(
      data?.period_end ||
        data?.subscription?.period_end ||
        data?.subscription?.next_payment_date ||
        data?.next_payment_date
    ) || membership.current_period_end;

  const updatePayload: Record<string, any> = {
    status: "active",
    current_period_start: periodStart,
    cancelled_at: null,
    updated_at: new Date().toISOString(),
  };

  if (periodEnd) {
    updatePayload.current_period_end = periodEnd;
  }

  if (subscriptionCode) {
    updatePayload.paystack_subscription_code =
      subscriptionCode;
  }

  if (customerCode) {
    updatePayload.paystack_customer_code =
      customerCode;
  }

  if (emailToken) {
    updatePayload.paystack_email_token =
      emailToken;
  }

  const { error } = await supabaseAdmin
    .from("member_subscriptions")
    .update(updatePayload)
    .eq("id", membership.id);

  if (error) {
    throw new Error(
      `Failed to update membership after charge.success: ${error.message}`
    );
  }

  try {
    await notifyMember({
      userId: membership.user_id,
      title: "HnC Membership Renewed 🎉",
      message: `Your HnC membership payment was confirmed and your membership is active${periodEnd ? ` through ${periodEnd}` : ""}.`,
    });

    await createAdminAlert({
      severity: "info",
      title: "HnC Membership Renewed",
      message: `Membership ${membership.id} was renewed successfully through the Paystack webhook.`,
      source: "membership.webhook",
      metadata: {
        event: "charge.success",
        user_id: membership.user_id,
        membership_id: membership.id,
        subscription_code: subscriptionCode,
        customer_code: customerCode,
        period_start: periodStart,
        period_end: periodEnd,
      },
    });
  } catch (notificationError) {
    console.error(
      "Membership webhook notification failed:",
      notificationError
    );
  }

  return {
    handled: true,
    membership_id: membership.id,
    status: "active",
    subscription_code: subscriptionCode,
  };
}

async function handleInvoicePaymentFailed(data: any) {
  const transaction = await updateHncTransactionFromWebhook(
    data,
    "invoice.payment_failed",
    getSubscriptionCode(data)
  );

  await recordWebhookEvent(
    transaction?.id || null,
    "invoice.payment_failed",
    data
  );

  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
      deferred: true,
      reason: "Membership subscription not found",
    };
  }

  const { error } = await supabaseAdmin
    .from("member_subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("id", membership.id);

  if (error) {
    throw new Error(
      `Failed to mark membership past_due: ${error.message}`
    );
  }

  try {
    await notifyMember({
      userId: membership.user_id,
      title: "HnC Membership Payment Needs Attention",
      message:
        "Your HnC membership payment could not be completed. Please check your payment method and membership status.",
    });

    await createAdminAlert({
      severity: "attention",
      title: "HnC Membership Payment Failed",
      message: `Membership ${membership.id} was marked past_due after a failed Paystack payment.`,
      source: "membership.webhook",
      metadata: {
        event: "invoice.payment_failed",
        user_id: membership.user_id,
        membership_id: membership.id,
        subscription_code: getSubscriptionCode(data),
        customer_code: getCustomerCode(data),
      },
    });
  } catch (notificationError) {
    console.error(
      "Membership payment-failure notification failed:",
      notificationError
    );
  }

  return {
    handled: true,
    membership_id: membership.id,
    status: "past_due",
  };
}

async function handleInvoiceUpdate(data: any) {
  const paid =
    data?.paid === true ||
    data?.status === "success" ||
    data?.status === "paid";

  if (paid) {
    return handleChargeSuccess(data);
  }

  const transaction = await updateHncTransactionFromWebhook(
    data,
    "invoice.update",
    getSubscriptionCode(data)
  );

  await recordWebhookEvent(
    transaction?.id || null,
    "invoice.update",
    data
  );

  return {
    handled: false,
    reason:
      "Invoice update did not contain a successful payment",
  };
}

async function handleSubscriptionNotRenew(data: any) {
  const transaction = await updateHncTransactionFromWebhook(
    data,
    "subscription.not_renew",
    getSubscriptionCode(data)
  );

  await recordWebhookEvent(
    transaction?.id || null,
    "subscription.not_renew",
    data
  );

  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
      deferred: true,
      reason: "Membership subscription not found",
    };
  }

  const periodEnd =
    parseDate(
      data?.next_payment_date ||
        data?.subscription?.next_payment_date
    ) || membership.current_period_end;

  const { error } = await supabaseAdmin
    .from("member_subscriptions")
    .update({
      status: "active",
      ...(periodEnd
        ? {
            current_period_end: periodEnd,
          }
        : {}),
      cancelled_at:
        membership.cancelled_at ||
        new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", membership.id);

  if (error) {
    throw new Error(
      `Failed to mark membership non-renewing: ${error.message}`
    );
  }

  try {
    await notifyMember({
      userId: membership.user_id,
      title: "HnC Membership Will Not Auto-Renew",
      message: `Your HnC membership will remain active until the current period ends${periodEnd ? ` on ${periodEnd}` : ""}, but it will not automatically renew.`,
    });

    await createAdminAlert({
      severity: "attention",
      title: "HnC Membership Will Not Auto-Renew",
      message: `Membership ${membership.id} was marked active/non-renewing by Paystack.`,
      source: "membership.webhook",
      metadata: {
        event: "subscription.not_renew",
        user_id: membership.user_id,
        membership_id: membership.id,
        subscription_code: getSubscriptionCode(data),
        current_period_end: periodEnd,
      },
    });
  } catch (notificationError) {
    console.error(
      "Membership non-renewal notification failed:",
      notificationError
    );
  }

  return {
    handled: true,
    membership_id: membership.id,
    status: "active",
    non_renewing: true,
  };
}

async function handleSubscriptionDisable(data: any) {
  const transaction = await updateHncTransactionFromWebhook(
    data,
    "subscription.disable",
    getSubscriptionCode(data)
  );

  await recordWebhookEvent(
    transaction?.id || null,
    "subscription.disable",
    data
  );

  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
      deferred: true,
      reason: "Membership subscription not found",
    };
  }

  const paystackStatus = String(
    data?.status ||
      data?.subscription?.status ||
      ""
  ).toLowerCase();

  const finalStatus =
    paystackStatus === "complete"
      ? "expired"
      : "cancelled";

  const { error } = await supabaseAdmin
    .from("member_subscriptions")
    .update({
      status: finalStatus,
      cancelled_at:
        membership.cancelled_at ||
        new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", membership.id);

  if (error) {
    throw new Error(
      `Failed to disable membership: ${error.message}`
    );
  }

  try {
    await notifyMember({
      userId: membership.user_id,
      title:
        finalStatus === "expired"
          ? "HnC Membership Expired"
          : "HnC Membership Cancelled",
      message:
        finalStatus === "expired"
          ? "Your HnC membership has expired."
          : "Your HnC membership has been cancelled.",
    });

    await createAdminAlert({
      severity: "attention",
      title:
        finalStatus === "expired"
          ? "HnC Membership Expired"
          : "HnC Membership Cancelled",
      message: `Membership ${membership.id} was marked ${finalStatus} by the Paystack webhook.`,
      source: "membership.webhook",
      metadata: {
        event: "subscription.disable",
        user_id: membership.user_id,
        membership_id: membership.id,
        subscription_code: getSubscriptionCode(data),
        paystack_status: paystackStatus,
        final_status: finalStatus,
      },
    });
  } catch (notificationError) {
    console.error(
      "Membership disable notification failed:",
      notificationError
    );
  }

  return {
    handled: true,
    membership_id: membership.id,
    status: finalStatus,
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signature =
      request.headers.get("x-paystack-signature") || "";

    if (!verifyPaystackSignature(rawBody, signature)) {
      console.warn(
        "Rejected Paystack webhook with invalid signature."
      );

      return NextResponse.json(
        {
          status: false,
          message: "Invalid webhook signature",
        },
        {
          status: 401,
        }
      );
    }

    let payload: PaystackWebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          status: false,
          message: "Invalid JSON payload",
        },
        {
          status: 400,
        }
      );
    }

    const event = String(payload.event || "").trim();
    const data = payload.data || {};

    if (!event) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing Paystack event",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "Paystack membership webhook received:",
      event
    );

    let result: Record<string, any>;

    switch (event) {
      case "subscription.create":
        result = await handleSubscriptionCreate(data);
        break;

      case "charge.success":
        result = await handleChargeSuccess(data);
        break;

      case "invoice.payment_failed":
        result =
          await handleInvoicePaymentFailed(data);
        break;

      case "invoice.update":
        result = await handleInvoiceUpdate(data);
        break;

      case "subscription.not_renew":
        result =
          await handleSubscriptionNotRenew(data);
        break;

      case "subscription.disable":
        result =
          await handleSubscriptionDisable(data);
        break;

      default:
        result = {
          handled: false,
          ignored: true,
          reason:
            "Event is not required by the HnC membership workflow",
        };
        break;
    }

    return NextResponse.json(
      {
        status: true,
        message: "Webhook received",
        event,
        result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Paystack membership webhook processing error:",
      error
    );

    return NextResponse.json(
      {
        status: false,
        message: "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}