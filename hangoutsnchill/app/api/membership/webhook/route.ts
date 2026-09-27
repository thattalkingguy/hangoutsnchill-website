import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

  if (customerCode) {
    const { data: subscription, error } = await supabaseAdmin
      .from("member_subscriptions")
      .select("*")
      .eq("paystack_customer_code", customerCode)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Membership subscription lookup by customer code failed:",
        error
      );
    }

    if (subscription) {
      return subscription;
    }
  }

  return null;
}

async function updateHncTransactionFromWebhook(
  data: any,
  event: string,
  subscriptionCode?: string | null
) {
  const reference = getReference(data);

  if (!reference) {
    return;
  }

  const { data: transaction, error: lookupError } =
    await supabaseAdmin
      .from("hnc_transactions")
      .select("id, metadata")
      .eq("payment_reference", reference)
      .maybeSingle();

  if (lookupError) {
    console.error(
      "HnC transaction webhook lookup failed:",
      lookupError
    );
    return;
  }

  if (!transaction) {
    return;
  }

  const existingMetadata =
    transaction.metadata &&
    typeof transaction.metadata === "object" &&
    !Array.isArray(transaction.metadata)
      ? transaction.metadata
      : {};

  const { error } = await supabaseAdmin
    .from("hnc_transactions")
    .update({
      metadata: {
        ...existingMetadata,
        last_paystack_webhook_event: event,
        last_paystack_webhook_at: new Date().toISOString(),
        ...(subscriptionCode
          ? {
              paystack_subscription_code: subscriptionCode,
            }
          : {}),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.id);

  if (error) {
    console.error(
      "HnC transaction webhook metadata update failed:",
      error
    );
  }
}

async function handleSubscriptionCreate(data: any) {
  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
      reason: "Membership subscription not found yet",
    };
  }

  const subscriptionCode = getSubscriptionCode(data);
  const customerCode = getCustomerCode(data);
  const emailToken = getEmailToken(data);

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (subscriptionCode) {
    updatePayload.paystack_subscription_code =
      subscriptionCode;
  }

  if (customerCode) {
    updatePayload.paystack_customer_code = customerCode;
  }

  if (emailToken) {
    updatePayload.paystack_email_token = emailToken;
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

  await updateHncTransactionFromWebhook(
    data,
    "subscription.create",
    subscriptionCode
  );

  return {
    handled: true,
    membership_id: membership.id,
    status: membership.status,
  };
}

async function handleChargeSuccess(data: any) {
  const membership = await findMembershipSubscription(data);

  if (!membership) {
    await updateHncTransactionFromWebhook(
      data,
      "charge.success",
      getSubscriptionCode(data)
    );

    return {
      handled: false,
      reason: "Membership subscription not found yet",
    };
  }

  const subscriptionCode = getSubscriptionCode(data);
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
    updatePayload.paystack_customer_code = customerCode;
  }

  if (emailToken) {
    updatePayload.paystack_email_token = emailToken;
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

  await updateHncTransactionFromWebhook(
    data,
    "charge.success",
    subscriptionCode
  );

  return {
    handled: true,
    membership_id: membership.id,
    status: "active",
  };
}

async function handleInvoicePaymentFailed(data: any) {
  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
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

  await updateHncTransactionFromWebhook(
    data,
    "invoice.payment_failed",
    getSubscriptionCode(data)
  );

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

  return {
    handled: false,
    reason: "Invoice update did not contain a successful payment",
  };
}

async function handleSubscriptionNotRenew(data: any) {
  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
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
        membership.cancelled_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", membership.id);

  if (error) {
    throw new Error(
      `Failed to mark membership non-renewing: ${error.message}`
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
  const membership = await findMembershipSubscription(data);

  if (!membership) {
    return {
      handled: false,
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
        result = await handleInvoicePaymentFailed(data);
        break;

      case "invoice.update":
        result = await handleInvoiceUpdate(data);
        break;

      case "subscription.not_renew":
        result = await handleSubscriptionNotRenew(data);
        break;

      case "subscription.disable":
        result = await handleSubscriptionDisable(data);
        break;

      default:
        result = {
          handled: false,
          ignored: true,
          reason: "Event is not required by the HnC membership workflow",
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