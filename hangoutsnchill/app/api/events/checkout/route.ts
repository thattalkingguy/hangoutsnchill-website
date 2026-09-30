import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CheckoutBody = {
  event_id?: string;
  ticket_id?: string;
  quantity?: number;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getCurrentPrice(
  basePrice: number,
  discountPercent: number | null,
  startsAt: string | null,
  endsAt: string | null
) {
  if (!discountPercent || discountPercent <= 0) {
    return basePrice;
  }

  const now = Date.now();

  if (startsAt && now < new Date(startsAt).getTime()) {
    return basePrice;
  }

  if (endsAt && now > new Date(endsAt).getTime()) {
    return basePrice;
  }

  return Math.round(basePrice * (1 - discountPercent / 100));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;

    const eventId = body.event_id?.trim();
    const ticketId = body.ticket_id?.trim();
    const buyerName = body.buyer_name?.trim();
    const buyerEmail = body.buyer_email?.trim().toLowerCase();
    const buyerPhone = body.buyer_phone?.trim();
    const quantity = Number(body.quantity);

    if (!eventId || !ticketId) {
      return NextResponse.json(
        {
          success: false,
          message: "Event and ticket are required.",
        },
        { status: 400 }
      );
    }

    if (!buyerName || buyerName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide your full name.",
        },
        { status: 400 }
      );
    }

    if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!buyerPhone || buyerPhone.length < 7) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid phone number.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket quantity must be between 1 and 20.",
        },
        { status: 400 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Paystack is not configured on the server.",
        },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();

    /*
     * Only published events may accept new ticket purchases.
     */
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(
        `
        id,
        slug,
        title,
        status,
        event_date,
        venue_name,
        venue_address,
        currency
      `
      )
      .eq("id", eventId)
      .eq("status", "published")
      .maybeSingle();

    if (eventError) {
      console.error("Event lookup error:", eventError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load this event.",
        },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          message: "This event is not currently accepting ticket purchases.",
        },
        { status: 400 }
      );
    }

    if (event.currency !== "NGN") {
      return NextResponse.json(
        {
          success: false,
          message: "This checkout currently supports NGN events only.",
        },
        { status: 400 }
      );
    }

    /*
     * Load the authoritative ticket information from Supabase.
     */
    const { data: ticket, error: ticketError } = await supabase
      .from("event_tickets")
      .select(
        `
        id,
        event_id,
        name,
        description,
        base_price,
        quantity_available,
        quantity_sold,
        discount_percent,
        discount_starts_at,
        discount_ends_at,
        is_active,
        sort_order
      `
      )
      .eq("id", ticketId)
      .eq("event_id", eventId)
      .eq("is_active", true)
      .maybeSingle();

    if (ticketError) {
      console.error("Ticket lookup error:", ticketError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to load this ticket.",
        },
        { status: 500 }
      );
    }

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "This ticket is no longer available.",
        },
        { status: 400 }
      );
    }

    /*
     * Check inventory.
     *
     * NULL quantity_available means unlimited.
     */
    const quantityAvailable =
      ticket.quantity_available === null
        ? null
        : Number(ticket.quantity_available);

    const quantitySold = Number(ticket.quantity_sold || 0);

    if (
      quantityAvailable !== null &&
      quantitySold + quantity > quantityAvailable
    ) {
      const remaining = Math.max(quantityAvailable - quantitySold, 0);

      return NextResponse.json(
        {
          success: false,
          message:
            remaining > 0
              ? `Only ${remaining} ticket${
                  remaining === 1 ? "" : "s"
                } remain for this category.`
              : "This ticket category is sold out.",
        },
        { status: 400 }
      );
    }

    const basePrice = Number(ticket.base_price);

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "This ticket has an invalid price configuration.",
        },
        { status: 500 }
      );
    }

    /*
     * Server-authoritative pricing.
     */
    const unitPrice = getCurrentPrice(
      basePrice,
      ticket.discount_percent,
      ticket.discount_starts_at,
      ticket.discount_ends_at
    );

    const subtotal = unitPrice * quantity;
    const normalSubtotal = basePrice * quantity;
    const discountAmount = Math.max(normalSubtotal - subtotal, 0);
    const totalAmount = subtotal;

    /*
     * ============================================================
     * CREATE HnC TRUST TRANSACTION
     * ============================================================
     *
     * IMPORTANT:
     * The HnC Trust schema uses payment_status/order_status/etc.
     * It does NOT use a generic "status" column.
     */
    const hncTransactionId = `HNC-EVT-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    const { data: hncTransaction, error: transactionError } = await supabase
      .from("hnc_transactions")
      .insert({
        transaction_id: hncTransactionId,
        buyer_id: null,
        seller_id: null,
        amount: totalAmount,
        currency: "NGN",
        payment_provider: "paystack",
        payment_reference: null,
        payment_status: "initiated",
        order_status: "created",
        settlement_status: "pending",
        dispute_status: "none",
        description: `${event.title} — ${ticket.name} x${quantity}`,
        metadata: {
          platform: "HangoutsNChill",
          transaction_type: "event_ticket",
          event_id: event.id,
          event_slug: event.slug,
          event_title: event.title,
          ticket_id: ticket.id,
          ticket_name: ticket.name,
          quantity,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
        },
        evidence: {
          checkout_created_at: new Date().toISOString(),
        },
        payment_initiated_at: new Date().toISOString(),
      })
      .select("id, transaction_id")
      .single();

    if (transactionError || !hncTransaction) {
      console.error(
        "HnC transaction creation error:",
        transactionError
      );

      return NextResponse.json(
        {
          success: false,
          message: "Unable to create the payment transaction.",
        },
        { status: 500 }
      );
    }

    /*
     * Record HnC Trust event.
     */
    const { error: transactionEventError } = await supabase
      .from("hnc_transaction_events")
      .insert({
        transaction_id: hncTransaction.id,
        event_type: "event_ticket_transaction_created",
        previous_status: null,
        new_status: "initiated",
        actor_id: null,
        description:
          "HnC event ticket payment transaction created before Paystack initialization.",
        event_data: {
          transaction_id: hncTransaction.transaction_id,
          event_id: event.id,
          event_slug: event.slug,
          ticket_id: ticket.id,
          ticket_name: ticket.name,
          quantity,
          amount: totalAmount,
          currency: "NGN",
          buyer_email: buyerEmail,
        },
      });

    if (transactionEventError) {
      console.error(
        "HnC transaction event creation error:",
        transactionEventError
      );
    }

    /*
     * ============================================================
     * CREATE EVENT ORDER
     * ============================================================
     */
    const { data: eventOrder, error: orderError } = await supabase
      .from("event_orders")
      .insert({
        event_id: event.id,
        ticket_id: ticket.id,
        buyer_user_id: null,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        quantity,
        unit_price: unitPrice,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        currency: "NGN",
        payment_status: "initiated",
        ticket_status: "reserved",
        paystack_reference: null,
        hnc_transaction_id: hncTransactionId,
        ticket_code: null,
        metadata: {
          event_slug: event.slug,
          event_title: event.title,
          ticket_name: ticket.name,
          base_price: basePrice,
          discount_percent: ticket.discount_percent,
          discount_starts_at: ticket.discount_starts_at,
          discount_ends_at: ticket.discount_ends_at,
        },
      })
      .select("id")
      .single();

    if (orderError || !eventOrder) {
      console.error("Event order creation error:", orderError);

      await supabase
        .from("hnc_transactions")
        .update({
          payment_status: "failed",
        })
        .eq("transaction_id", hncTransactionId);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to create the ticket order.",
        },
        { status: 500 }
      );
    }

    /*
     * ============================================================
     * INITIALIZE PAYSTACK
     * ============================================================
     */
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const callbackUrl = `${siteUrl.replace(
      /\/$/,
      ""
    )}/events/payment/success`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: buyerEmail,
          amount: Math.round(totalAmount * 100),
          currency: "NGN",
          callback_url: callbackUrl,
          metadata: {
            source: "hnc_events",
            event_order_id: eventOrder.id,
            event_id: event.id,
            event_slug: event.slug,
            event_title: event.title,
            ticket_id: ticket.id,
            ticket_name: ticket.name,
            quantity,
            unit_price: unitPrice,
            subtotal,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            buyer_name: buyerName,
            buyer_email: buyerEmail,
            buyer_phone: buyerPhone,
            hnc_transaction_id: hncTransactionId,
            hnc_transaction_uuid: hncTransaction.id,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData?.status) {
      console.error(
        "Paystack initialization failed:",
        paystackData
      );

      await supabase
        .from("event_orders")
        .update({
          payment_status: "failed",
        })
        .eq("id", eventOrder.id);

      await supabase
        .from("hnc_transactions")
        .update({
          payment_status: "failed",
        })
        .eq("transaction_id", hncTransactionId);

      await supabase
        .from("hnc_transaction_events")
        .insert({
          transaction_id: hncTransaction.id,
          event_type: "paystack_initialization_failed",
          previous_status: "initiated",
          new_status: "failed",
          actor_id: null,
          description:
            "Paystack checkout initialization failed.",
          event_data: {
            paystack_response: paystackData,
            event_order_id: eventOrder.id,
          },
        });

      return NextResponse.json(
        {
          success: false,
          message:
            paystackData?.message ||
            "Unable to initialize Paystack checkout.",
        },
        { status: 502 }
      );
    }

    const reference = paystackData.data?.reference;
    const authorizationUrl = paystackData.data?.authorization_url;
    const accessCode = paystackData.data?.access_code;

    if (!reference || !authorizationUrl) {
      console.error(
        "Paystack returned incomplete checkout data:",
        paystackData
      );

      await supabase
        .from("event_orders")
        .update({
          payment_status: "failed",
        })
        .eq("id", eventOrder.id);

      await supabase
        .from("hnc_transactions")
        .update({
          payment_status: "failed",
        })
        .eq("transaction_id", hncTransactionId);

      return NextResponse.json(
        {
          success: false,
          message: "Paystack did not return a valid checkout URL.",
        },
        { status: 502 }
      );
    }

    /*
     * Store Paystack reference.
     */
    const { error: updateOrderError } = await supabase
      .from("event_orders")
      .update({
        paystack_reference: reference,
      })
      .eq("id", eventOrder.id);

    if (updateOrderError) {
      console.error(
        "Event order reference update error:",
        updateOrderError
      );
    }

    const { error: updateTransactionError } = await supabase
      .from("hnc_transactions")
      .update({
        payment_reference: reference,
      })
      .eq("transaction_id", hncTransactionId);

    if (updateTransactionError) {
      console.error(
        "HnC transaction Paystack reference update error:",
        updateTransactionError
      );
    }

    /*
     * Record Paystack initialization.
     */
    const { error: initializedEventError } = await supabase
      .from("hnc_transaction_events")
      .insert({
        transaction_id: hncTransaction.id,
        event_type: "payment_initialized",
        previous_status: "initiated",
        new_status: "initiated",
        actor_id: null,
        description:
          "Paystack checkout initialized for HnC event ticket.",
        event_data: {
          event_order_id: eventOrder.id,
          event_id: event.id,
          ticket_id: ticket.id,
          quantity,
          paystack_reference: reference,
          amount: totalAmount,
          currency: "NGN",
        },
      });

    if (initializedEventError) {
      console.error(
        "HnC payment initialization event error:",
        initializedEventError
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: authorizationUrl,
      access_code: accessCode,
      reference,
      event_order_id: eventOrder.id,
      hnc_transaction_id: hncTransactionId,
    });
  } catch (error) {
    console.error("Events checkout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during checkout.",
      },
      { status: 500 }
    );
  }
}