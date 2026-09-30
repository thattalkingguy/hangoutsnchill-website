import { NextResponse } from "next/server";
import crypto from "crypto";

function getPaystackSignature(rawBody: string, secret: string) {
  return crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export async function POST(request: Request) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      console.error("Paystack webhook: secret key is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Webhook server configuration is missing.",
        },
        { status: 500 }
      );
    }

    /*
     * IMPORTANT:
     * Paystack signs the raw request body.
     * We must read request.text() before parsing JSON.
     */
    const rawBody = await request.text();

    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      console.warn("Paystack webhook: missing signature.");

      return NextResponse.json(
        {
          success: false,
          message: "Missing Paystack signature.",
        },
        { status: 401 }
      );
    }

    /*
     * Verify that the webhook really came from Paystack.
     */
    const expectedSignature = getPaystackSignature(
      rawBody,
      paystackSecret
    );

    if (!safeEqual(expectedSignature, signature)) {
      console.warn("Paystack webhook: invalid signature.");

      return NextResponse.json(
        {
          success: false,
          message: "Invalid Paystack signature.",
        },
        { status: 401 }
      );
    }

    let payload: {
      event?: string;
      data?: {
        reference?: string;
        status?: string;
      };
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.warn("Paystack webhook: invalid JSON payload.");

      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook payload.",
        },
        { status: 400 }
      );
    }

    /*
     * We only need successful transaction events for ticket issuance.
     *
     * Other Paystack webhook events are acknowledged so Paystack
     * does not repeatedly retry events HnC does not need to process.
     */
    if (payload.event !== "charge.success") {
      return NextResponse.json({
        success: true,
        received: true,
        ignored: true,
        event: payload.event || null,
      });
    }

    const reference = String(payload.data?.reference || "").trim();

    if (!reference) {
      console.error(
        "Paystack webhook: charge.success has no transaction reference."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Successful payment has no Paystack reference.",
        },
        { status: 400 }
      );
    }

    /*
     * HnC already has a strong payment-verification route that:
     *
     * 1. Verifies the transaction directly with Paystack.
     * 2. Confirms the HnC order.
     * 3. Confirms the exact amount.
     * 4. Protects ticket inventory atomically.
     * 5. Generates the ticket code.
     * 6. Confirms the event order.
     * 7. Updates HnC Trust.
     *
     * Reuse that exact verification path instead of duplicating
     * payment logic in the webhook.
     */
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const verifyUrl = `${siteUrl.replace(
      /\/$/,
      ""
    )}/api/events/payment/verify`;

    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        reference,
      }),
      cache: "no-store",
    });

    const verifyData = await verifyResponse.json();

    /*
     * If HnC successfully processed the payment, acknowledge
     * the webhook.
     *
     * already_processed is also a success because Paystack may
     * legitimately deliver the same event more than once.
     */
    if (
      verifyResponse.ok &&
      verifyData?.success
    ) {
      return NextResponse.json({
        success: true,
        received: true,
        processed: true,
        already_processed:
          verifyData?.already_processed === true,
        reference,
      });
    }

    /*
     * A 500 tells Paystack that HnC could not complete processing.
     * Paystack can then retry the webhook according to its
     * live webhook retry policy.
     */
    console.error(
      "Paystack webhook: HnC payment verification failed.",
      {
        reference,
        verifyStatus: verifyResponse.status,
        verifyData,
      }
    );

    return NextResponse.json(
      {
        success: false,
        received: true,
        processed: false,
        message:
          verifyData?.message ||
          "HnC could not complete payment verification.",
        reference,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Paystack webhook error:", error);

    /*
     * Return 500 so Paystack can retry a failed webhook delivery.
     */
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected webhook processing error.",
      },
      { status: 500 }
    );
  }
}