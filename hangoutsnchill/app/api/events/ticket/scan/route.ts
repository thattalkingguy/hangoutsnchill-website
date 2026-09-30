import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

async function getAdminUser(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.substring(7);

  if (!accessToken) {
    return null;
  }

  const supabaseAdmin = getAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
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

export async function POST(request: Request) {
  try {
    // ---------------------------------------------------------
    // ADMIN AUTHENTICATION
    // ---------------------------------------------------------
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          status: "unauthorized",
          message: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const ticketCode = String(body?.ticket_code || "")
      .trim()
      .toUpperCase();

    if (!ticketCode) {
      return NextResponse.json(
        {
          success: false,
          status: "invalid",
          message: "Ticket code is required.",
        },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // ---------------------------------------------------------
    // Find the ticket/order
    // ---------------------------------------------------------
    const { data: order, error: orderError } = await supabase
      .from("event_orders")
      .select(
        `
        id,
        event_id,
        ticket_id,
        buyer_name,
        buyer_email,
        buyer_phone,
        quantity,
        unit_price,
        total_amount,
        currency,
        payment_status,
        ticket_status,
        ticket_code,
        ticket_used_count,
        ticket_used_at,
        paid_at
      `
      )
      .eq("ticket_code", ticketCode)
      .maybeSingle();

    if (orderError) {
      console.error("Ticket lookup error:", orderError);

      return NextResponse.json(
        {
          success: false,
          status: "error",
          message: "Unable to verify this ticket.",
        },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          status: "invalid",
          message: "This ticket code is not valid.",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // Payment validation
    // ---------------------------------------------------------
    if (order.payment_status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          status: "invalid",
          message: "This ticket has not been confirmed as paid.",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // Ticket status validation
    // ---------------------------------------------------------
    if (
      order.ticket_status !== "confirmed" &&
      order.ticket_status !== "used"
    ) {
      return NextResponse.json(
        {
          success: false,
          status: "invalid",
          message: "This ticket is not valid for admission.",
        },
        { status: 409 }
      );
    }

    const quantity = Number(order.quantity || 0);
    const usedCount = Number(order.ticket_used_count || 0);

    // ---------------------------------------------------------
    // Invalid ticket quantity protection
    // ---------------------------------------------------------
    if (quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          status: "invalid",
          message: "This ticket has an invalid admission quantity.",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // Already fully used
    // ---------------------------------------------------------
    if (usedCount >= quantity) {
      return NextResponse.json(
        {
          success: false,
          status: "used",
          message: "This ticket has already been fully used.",
          ticket: {
            ticket_code: order.ticket_code,
            quantity,
            used_count: usedCount,
          },
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // Atomically consume ONE admission.
    //
    // The WHERE clause prevents two scanners from consuming
    // the same remaining admission simultaneously.
    // ---------------------------------------------------------
    const newUsedCount = usedCount + 1;

    const { data: updatedOrder, error: updateError } = await supabase
      .from("event_orders")
      .update({
        ticket_used_count: newUsedCount,
        ticket_used_at: new Date().toISOString(),
        ticket_status: newUsedCount >= quantity ? "used" : "confirmed",
      })
      .eq("id", order.id)
      .eq("ticket_used_count", usedCount)
      .select(
        `
        id,
        event_id,
        ticket_id,
        buyer_name,
        buyer_email,
        buyer_phone,
        quantity,
        unit_price,
        total_amount,
        currency,
        payment_status,
        ticket_status,
        ticket_code,
        ticket_used_count,
        ticket_used_at,
        paid_at
      `
      )
      .maybeSingle();

    if (updateError) {
      console.error("Ticket admission update error:", updateError);

      return NextResponse.json(
        {
          success: false,
          status: "error",
          message: "Unable to complete ticket admission.",
        },
        { status: 500 }
      );
    }

    // If another scanner consumed this admission first,
    // the conditional update returns no row.
    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          status: "used",
          message:
            "This admission was already processed by another scan.",
        },
        { status: 409 }
      );
    }

    // ---------------------------------------------------------
    // Load event and ticket information
    // ---------------------------------------------------------
    const [{ data: event }, { data: ticket }] = await Promise.all([
      supabase
        .from("events")
        .select(
          `
          id,
          slug,
          title,
          event_date,
          venue_name,
          venue_address,
          status
        `
        )
        .eq("id", updatedOrder.event_id)
        .maybeSingle(),

      supabase
        .from("event_tickets")
        .select(
          `
          id,
          name
        `
        )
        .eq("id", updatedOrder.ticket_id)
        .maybeSingle(),
    ]);

    return NextResponse.json({
      success: true,
      status: "admitted",
      message:
        newUsedCount >= quantity
          ? "Ticket accepted. All admissions on this ticket have now been used."
          : "Ticket accepted. Admission recorded.",

      ticket: {
        ticket_code: updatedOrder.ticket_code,
        buyer_name: updatedOrder.buyer_name,
        buyer_email: updatedOrder.buyer_email,
        buyer_phone: updatedOrder.buyer_phone,
        quantity: updatedOrder.quantity,
        used_count: updatedOrder.ticket_used_count,
        remaining_count: Math.max(
          Number(updatedOrder.quantity) -
            Number(updatedOrder.ticket_used_count),
          0
        ),
        ticket_status: updatedOrder.ticket_status,
        payment_status: updatedOrder.payment_status,
        paid_at: updatedOrder.paid_at,
        ticket_used_at: updatedOrder.ticket_used_at,
      },

      event: event
        ? {
            id: event.id,
            slug: event.slug,
            title: event.title,
            event_date: event.event_date,
            venue_name: event.venue_name,
            venue_address: event.venue_address,
            status: event.status,
          }
        : null,

      ticket_type: ticket
        ? {
            id: ticket.id,
            name: ticket.name,
          }
        : null,

      scanned_by: {
        user_id: admin.user.id,
        name: admin.profile.full_name,
      },
    });
  } catch (error) {
    console.error("Ticket scan error:", error);

    return NextResponse.json(
      {
        success: false,
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected ticket verification error occurred.",
      },
      { status: 500 }
    );
  }
}