import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function generateTicketCode() {
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `HNC-${Date.now().toString(36).toUpperCase()}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reference = String(body?.reference || "").trim();

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Paystack reference.",
        },
        { status: 400 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Paystack server configuration is missing.",
        },
        { status: 500 }
      );
    }

    const supabase = getAdminClient();

    // ---------------------------------------------------------
    // 1. Verify payment directly with Paystack
    // ---------------------------------------------------------
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const paystackData = await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      paystackData?.data?.status !== "success"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Paystack payment could not be verified.",
          reference,
        },
        { status: 400 }
      );
    }

    const payment = paystackData.data;
    const metadata = payment.metadata || {};

    const eventOrderId = metadata.event_order_id;
    const hncTransactionId = metadata.hnc_transaction_id;

    if (!eventOrderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Paystack payment is missing the HnC event order reference.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 2. Load event order
    // ---------------------------------------------------------
    const { data: order, error: orderError } = await supabase
      .from("event_orders")
      .select("*")
      .eq("id", eventOrderId)
      .single();

    if (orderError || !order) {
      console.error("Event order lookup failed:", orderError);

      return NextResponse.json(
        {
          success: false,
          message: "HnC event order could not be found.",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // 3. Idempotency
    // ---------------------------------------------------------
    if (
      order.payment_status === "paid" &&
      order.ticket_status === "confirmed" &&
      order.ticket_code
    ) {
      const { data: existingEvent } = await supabase
        .from("events")
        .select(
          `
          id,
          slug,
          title,
          event_date,
          venue_name,
          venue_address,
          currency
        `
        )
        .eq("id", order.event_id)
        .single();

      const { data: existingTicket } = await supabase
        .from("event_tickets")
        .select("id, name")
        .eq("id", order.ticket_id)
        .single();

      return NextResponse.json({
        success: true,
        already_processed: true,
        ticket: {
          ticket_code: order.ticket_code,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
          buyer_phone: order.buyer_phone,
          quantity: order.quantity,
          unit_price: order.unit_price,
          total_amount: order.total_amount,
          currency: order.currency || existingEvent?.currency || "NGN",
          event: existingEvent,
          ticket: existingTicket,
          paystack_reference: order.paystack_reference,
        },
      });
    }

    // ---------------------------------------------------------
    // 4. Confirm Paystack reference belongs to this order
    // ---------------------------------------------------------
    if (
      order.paystack_reference &&
      order.paystack_reference !== reference
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Paystack reference does not match this event order.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 5. Confirm payment amount
    // ---------------------------------------------------------
    const expectedAmountKobo = Math.round(
      Number(order.total_amount) * 100
    );

    const paidAmountKobo = Number(payment.amount);

    if (
      !Number.isFinite(expectedAmountKobo) ||
      !Number.isFinite(paidAmountKobo) ||
      expectedAmountKobo !== paidAmountKobo
    ) {
      console.error("Amount mismatch:", {
        expectedAmountKobo,
        paidAmountKobo,
        orderId: order.id,
        reference,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Payment amount does not match the HnC order.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 6. Load event
    // ---------------------------------------------------------
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select(
        `
        id,
        slug,
        title,
        event_date,
        venue_name,
        venue_address,
        currency,
        status
      `
      )
      .eq("id", order.event_id)
      .single();

    if (eventError || !event) {
      console.error("Event lookup failed:", eventError);

      return NextResponse.json(
        {
          success: false,
          message: "Event could not be found.",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // 7. Load ticket
    // ---------------------------------------------------------
    const { data: ticket, error: ticketError } = await supabase
      .from("event_tickets")
      .select(
        `
        id,
        name,
        quantity_available,
        quantity_sold
      `
      )
      .eq("id", order.ticket_id)
      .eq("event_id", order.event_id)
      .single();

    if (ticketError || !ticket) {
      console.error("Ticket lookup failed:", ticketError);

      return NextResponse.json(
        {
          success: false,
          message: "Event ticket could not be found.",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // 8. Validate requested quantity
    // ---------------------------------------------------------
    const requestedQuantity = Number(order.quantity || 1);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ticket quantity.",
        },
        { status: 400 }
      );
    }

    const quantityAvailable =
      ticket.quantity_available === null
        ? null
        : Number(ticket.quantity_available);

    const quantitySold = Number(ticket.quantity_sold || 0);

    // ---------------------------------------------------------
    // 9. Generate unique ticket code
    // ---------------------------------------------------------
    let ticketCode = generateTicketCode();

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existingCode } = await supabase
        .from("event_orders")
        .select("id")
        .eq("ticket_code", ticketCode)
        .maybeSingle();

      if (!existingCode) {
        break;
      }

      ticketCode = generateTicketCode();
    }

    // ---------------------------------------------------------
    // 10. Atomically reserve the sold quantity
    //
    // The quantity_sold value is included in the WHERE clause.
    // This prevents two simultaneous verification requests from
    // both successfully updating the same inventory value.
    // ---------------------------------------------------------
    let inventoryQuery = supabase
      .from("event_tickets")
      .update({
        quantity_sold: quantitySold + requestedQuantity,
      })
      .eq("id", ticket.id)
      .eq("quantity_sold", quantitySold);

    if (quantityAvailable !== null) {
      inventoryQuery = inventoryQuery.lte(
        "quantity_sold",
        quantityAvailable - requestedQuantity
      ) as typeof inventoryQuery;
    }

    const { data: updatedTicketInventory, error: ticketUpdateError } =
      await inventoryQuery.select(
        "id, name, quantity_available, quantity_sold"
      );

    if (ticketUpdateError) {
      console.error(
        "Ticket inventory update failed:",
        ticketUpdateError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment was verified, but HnC could not secure the requested ticket inventory.",
        },
        { status: 409 }
      );
    }

    if (
      !updatedTicketInventory ||
      updatedTicketInventory.length !== 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sorry, this ticket category is sold out or another purchase was processed at the same time. Please contact HnC support before making another payment.",
          payment_verified: true,
          reference,
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // 11. Confirm HnC event order
    // ---------------------------------------------------------
    const { data: updatedOrder, error: updateOrderError } = await supabase
      .from("event_orders")
      .update({
        payment_status: "paid",
        ticket_status: "confirmed",
        paystack_reference: reference,
        hnc_transaction_id:
          hncTransactionId || order.hnc_transaction_id || null,
        ticket_code: ticketCode,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .select("*")
      .single();

    if (updateOrderError || !updatedOrder) {
      console.error("Event order update failed:", updateOrderError);

      // Attempt to release the inventory we just secured.
      // The quantity_sold comparison prevents us from reducing
      // inventory that may already have been changed by another
      // successful transaction.
      const expectedCurrentQuantity =
        quantitySold + requestedQuantity;

      const { error: rollbackError } = await supabase
        .from("event_tickets")
        .update({
          quantity_sold: quantitySold,
        })
        .eq("id", ticket.id)
        .eq("quantity_sold", expectedCurrentQuantity);

      if (rollbackError) {
        console.error(
          "Inventory rollback failed:",
          rollbackError
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment was verified, but HnC could not confirm the ticket.",
          payment_verified: true,
          reference,
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 12. Update HnC Trust transaction
    // ---------------------------------------------------------
    if (hncTransactionId) {
      const { data: trustTransaction, error: trustLookupError } =
        await supabase
          .from("hnc_transactions")
          .select("id, transaction_id")
          .eq("transaction_id", hncTransactionId)
          .maybeSingle();

      if (trustLookupError) {
        console.error(
          "HnC Trust transaction lookup failed:",
          trustLookupError
        );
      }

      if (trustTransaction) {
        const { error: trustUpdateError } = await supabase
          .from("hnc_transactions")
          .update({
            payment_reference: reference,
            payment_status: "verified",
            order_status: "processing",
            settlement_status: "pending",
          })
          .eq("transaction_id", hncTransactionId);

        if (trustUpdateError) {
          console.error(
            "HnC Trust transaction update failed:",
            trustUpdateError
          );
        }

        // IMPORTANT:
        // hnc_transaction_events.transaction_id expects
        // the UUID primary key from hnc_transactions.id,
        // NOT the human-readable HNC-EVT-... transaction_id.
        const { error: trustEventError } = await supabase
          .from("hnc_transaction_events")
          .insert({
            transaction_id: trustTransaction.id,
            event_type: "payment_verified",
            previous_status: "initiated",
            new_status: "verified",
            actor_id: null,
            description:
              "Paystack payment verified for HnC event ticket.",
            event_data: {
              event_order_id: order.id,
              event_id: order.event_id,
              ticket_id: order.ticket_id,
              paystack_reference: reference,
              amount: order.total_amount,
              quantity: requestedQuantity,
              ticket_code: ticketCode,
              hnc_transaction_id: hncTransactionId,
            },
          });

        if (trustEventError) {
          console.error(
            "HnC Trust event insert failed:",
            trustEventError
          );
        }
      }
    }

    // ---------------------------------------------------------
    // 13. Return response in the exact structure expected
    //     by the payment success page.
    // ---------------------------------------------------------
    return NextResponse.json({
      success: true,
      already_processed: false,
      ticket: {
        ticket_code: ticketCode,
        buyer_name: updatedOrder.buyer_name,
        buyer_email: updatedOrder.buyer_email,
        buyer_phone: updatedOrder.buyer_phone,
        quantity: updatedOrder.quantity,
        unit_price: updatedOrder.unit_price,
        total_amount: updatedOrder.total_amount,
        currency: event.currency || "NGN",

        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          event_date: event.event_date,
          venue_name: event.venue_name,
          venue_address: event.venue_address,
        },

        ticket: {
          id: ticket.id,
          name: ticket.name,
        },

        paystack_reference: reference,
      },
    });
  } catch (error) {
    console.error("Event payment verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected payment verification error occurred.",
      },
      { status: 500 }
    );
  }
}