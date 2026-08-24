import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const required = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const supabaseAdmin = createClient(
  required("NEXT_PUBLIC_SUPABASE_URL"),
  required("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const resend = new Resend(required("RESEND_API_KEY"));

const ADMIN_EMAIL =
  process.env.BOOKING_ADMIN_EMAIL || "musicatunbi@gmail.com";

const FROM_EMAIL =
  process.env.BOOKING_FROM_EMAIL ||
  "ÀTÚNBÍ Entertainment <onboarding@resend.dev>";

/**
 * Security:
 * GET and PATCH are admin-only.
 * POST remains public because clients must be able to submit bookings.
 */
async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    console.error("ÀTÚNBÍ ADMIN AUTH ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  const loggedInEmail = data.user.email?.trim().toLowerCase();
  const configuredAdminEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (!loggedInEmail || loggedInEmail !== configuredAdminEmail) {
    return NextResponse.json(
      { success: false, message: "Forbidden." },
      { status: 403 }
    );
  }

  return null;
}

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const row = (label: string, value: unknown) =>
  `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #eee6d5;width:38%;vertical-align:top;">
      <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8A7B6B;">
        ${escapeHtml(label)}
      </span>
    </td>
    <td style="padding:12px 0;border-bottom:1px solid #eee6d5;vertical-align:top;">
      <span style="font-size:15px;font-weight:600;color:#17130F;">
        ${escapeHtml(value)}
      </span>
    </td>
  </tr>`;

const layout = (content: string) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>ÀTÚNBÍ Entertainment</title>
</head>
<body style="margin:0;padding:0;background:#F7F1E3;font-family:Arial,Helvetica,sans-serif;color:#17130F;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F1E3;">
<tr>
<td align="center" style="padding:40px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #D8B45A33;">
<tr>
<td style="background:#17130F;padding:32px 34px;text-align:center;">
<div style="font-size:12px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:#D8B45A;">ÀTÚNBÍ</div>
<div style="margin-top:8px;font-size:14px;letter-spacing:2px;color:#F7F1E3;">ENTERTAINMENT</div>
</td>
</tr>
<tr>
<td style="padding:36px 34px;">${content}</td>
</tr>
<tr>
<td style="background:#17130F;padding:26px 34px;text-align:center;">
<div style="font-size:14px;font-weight:700;color:#D8B45A;">ÀTÚNBÍ Entertainment</div>
<div style="margin-top:8px;font-size:12px;line-height:20px;color:#CFC6B8;">musicatunbi@gmail.com</div>
<div style="margin-top:8px;font-size:11px;line-height:18px;color:#8F8578;">© 2026 ÀTÚNBÍ Entertainment. All rights reserved.</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

/* =========================
   GET — ADMIN ONLY
   ========================= */
export async function GET(request: Request) {
  const authError = await requireAdmin(request);

  if (authError) {
    return authError;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ÀTÚNBÍ ADMIN BOOKINGS GET ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unable to load bookings.",
          code: error.code || null,
          details: error.details || null,
          hint: error.hint || null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: data || [],
    });
  } catch (error) {
    console.error("ÀTÚNBÍ ADMIN BOOKINGS GET EXCEPTION:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load bookings.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   POST — PUBLIC BOOKING
   ========================= */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      clientName,
      phone,
      email,
      eventType,
      eventDate,
      eventLocation,
      venue,
      guests,
      duration,
      budget,
      requirements,
      message,
    } = body;

    if (
      !clientName?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !eventType?.trim() ||
      !eventDate?.trim() ||
      !eventLocation?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please complete your name, phone, email, event type, event date and location.",
        },
        { status: 400 }
      );
    }

    const booking = {
      client_name: clientName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      event_type: eventType.trim(),
      event_date: eventDate,
      event_location: eventLocation.trim(),
      venue: venue?.trim() || eventLocation.trim(),
      guests: guests ? Number(guests) : null,
      duration: duration?.trim() || null,
      artist: "ÀTÚNBÍ",
      budget: budget?.trim() || null,
      requirements: requirements?.trim() || null,
      message: message?.trim() || null,
      status: "pending",
    };

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert(booking)
      .select()
      .single();

    if (error) {
      console.error("ÀTÚNBÍ SUPABASE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message:
            error.message || "Unable to save booking request.",
          code: error.code || null,
          details: error.details || null,
          hint: error.hint || null,
        },
        { status: 500 }
      );
    }

    const formattedDate = new Date(
      `${booking.event_date}T00:00:00`
    ).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const safeMessage = booking.message
      ? escapeHtml(booking.message)
      : "";

    const details =
      row("Event", booking.event_type) +
      row("Date", formattedDate) +
      row("Location", booking.event_location) +
      row("Venue", booking.venue || "Not specified") +
      row("Guests", booking.guests ?? "Not specified") +
      row("Duration", booking.duration || "Not specified") +
      row("Budget", booking.budget || "Not specified") +
      row("Booking ID", data.id);

    const clientContent = `
<h1 style="margin:0;font-size:30px;line-height:38px;font-weight:800;color:#17130F;">Booking Request Received</h1>
<p style="margin:18px 0 0;font-size:16px;line-height:26px;color:#51483E;">
Hello <strong>${escapeHtml(booking.client_name)}</strong>,
</p>
<p style="margin:14px 0 0;font-size:15px;line-height:25px;color:#51483E;">
Thank you for choosing ÀTÚNBÍ Entertainment. Your booking request has been received successfully.
</p>
<div style="margin:26px 0;padding:16px 18px;border-radius:14px;background:#F7F1E3;border-left:4px solid #D8B45A;">
<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#A47B22;">Current Status</div>
<div style="margin-top:6px;font-size:17px;font-weight:800;color:#17130F;">Pending Review</div>
</div>
<h2 style="margin:28px 0 8px;font-size:18px;color:#17130F;">Your Booking Details</h2>
<table width="100%" cellpadding="0" cellspacing="0" border="0">${details}</table>
${
  safeMessage
    ? `<div style="margin-top:24px;">
<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#A47B22;">Your Message</div>
<div style="margin-top:8px;padding:16px;background:#F7F1E3;border-radius:12px;font-size:14px;line-height:23px;color:#51483E;">${safeMessage}</div>
</div>`
    : ""
}
<p style="margin:28px 0 0;font-size:15px;line-height:25px;color:#51483E;">
Our team will review your request and contact you regarding availability, terms and booking confirmation.
</p>
<p style="margin:22px 0 0;font-size:15px;line-height:25px;color:#17130F;font-weight:700;">
Thank you for choosing ÀTÚNBÍ Entertainment.
</p>`;

    const clientText =
      `Hello ${booking.client_name},\n\n` +
      `Thank you for choosing ÀTÚNBÍ Entertainment.\n\n` +
      `Your booking request has been received successfully.\n\n` +
      `BOOKING DETAILS\n\n` +
      `Event: ${booking.event_type}\n` +
      `Date: ${formattedDate}\n` +
      `Location: ${booking.event_location}\n` +
      `Venue: ${booking.venue || "Not specified"}\n` +
      `Guests: ${booking.guests ?? "Not specified"}\n` +
      `Duration: ${booking.duration || "Not specified"}\n` +
      `Budget: ${booking.budget || "Not specified"}\n` +
      `Booking ID: ${data.id}\n\n` +
      `Status: Pending Review\n\n` +
      (booking.message
        ? `Your Message:\n${booking.message}\n\n`
        : "") +
      `Our team will review your request and contact you regarding availability, terms and booking confirmation.\n\n` +
      `ÀTÚNBÍ Entertainment\nmusicatunbi@gmail.com`;

    const adminContent = `
<div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#17130F;color:#D8B45A;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
New Booking Request
</div>
<h1 style="margin:18px 0 0;font-size:29px;line-height:37px;font-weight:800;color:#17130F;">New ÀTÚNBÍ Booking</h1>
<p style="margin:12px 0 0;font-size:15px;line-height:24px;color:#51483E;">
A new entertainment booking request has been submitted through the website.
</p>
<h2 style="margin:28px 0 8px;font-size:18px;color:#17130F;">Client Information</h2>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
${row("Name", booking.client_name)}
${row("Phone", booking.phone)}
${row("Email", booking.email)}
</table>
<h2 style="margin:28px 0 8px;font-size:18px;color:#17130F;">Event Information</h2>
<table width="100%" cellpadding="0" cellspacing="0" border="0">${details}</table>
${
  booking.requirements
    ? `<div style="margin-top:24px;">
<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#A47B22;">Special Requirements</div>
<div style="margin-top:8px;padding:16px;background:#F7F1E3;border-radius:12px;font-size:14px;line-height:23px;color:#51483E;">${escapeHtml(booking.requirements)}</div>
</div>`
    : ""
}
${
  safeMessage
    ? `<div style="margin-top:24px;">
<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#A47B22;">Client Message</div>
<div style="margin-top:8px;padding:16px;background:#F7F1E3;border-radius:12px;font-size:14px;line-height:23px;color:#51483E;">${safeMessage}</div>
</div>`
    : ""
}
<div style="margin-top:30px;padding:16px;background:#F7F1E3;border-radius:14px;font-size:13px;line-height:22px;color:#51483E;">
Please log in to the ÀTÚNBÍ Entertainment admin dashboard to review and manage this booking.
</div>`;

    const adminText =
      `NEW ÀTÚNBÍ ENTERTAINMENT BOOKING\n\n` +
      `CLIENT\n` +
      `Name: ${booking.client_name}\n` +
      `Phone: ${booking.phone}\n` +
      `Email: ${booking.email}\n\n` +
      `EVENT\n` +
      `Type: ${booking.event_type}\n` +
      `Date: ${formattedDate}\n` +
      `Location: ${booking.event_location}\n` +
      `Venue: ${booking.venue || "Not specified"}\n` +
      `Guests: ${booking.guests ?? "Not specified"}\n` +
      `Duration: ${booking.duration || "Not specified"}\n` +
      `Budget: ${booking.budget || "Not specified"}\n` +
      `Requirements: ${booking.requirements || "None"}\n` +
      `Message: ${booking.message || "None"}\n\n` +
      `BOOKING ID: ${data.id}\n` +
      `STATUS: Pending\n\n` +
      `Please log in to the ÀTÚNBÍ Entertainment admin dashboard to review and manage this booking.\n\n` +
      `ÀTÚNBÍ Entertainment\nmusicatunbi@gmail.com`;

    try {
      const [clientEmail, adminEmail] = await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: [booking.email],
          subject:
            "ÀTÚNBÍ Entertainment — Booking Request Received",
          html: layout(clientContent),
          text: clientText,
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject:
            "New ÀTÚNBÍ Entertainment Booking Request",
          html: layout(adminContent),
          text: adminText,
        }),
      ]);

      if (clientEmail.error) {
        console.error(
          "ÀTÚNBÍ client email error:",
          clientEmail.error
        );
      }

      if (adminEmail.error) {
        console.error(
          "ÀTÚNBÍ admin email error:",
          adminEmail.error
        );
      }
    } catch (emailError) {
      console.error("ÀTÚNBÍ email exception:", emailError);
    }

    return NextResponse.json({
      success: true,
      message:
        "Booking request received. Thank you. ÀTÚNBÍ Entertainment will review your request and respond with availability, terms and booking details.",
      booking: data,
    });
  } catch (error) {
    console.error("ÀTÚNBÍ booking API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your request.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH — ADMIN ONLY
   ========================= */
export async function PATCH(request: Request) {
  const authError = await requireAdmin(request);

  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID and status are required.",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "pending",
      "contacted",
      "confirmed",
      "completed",
      "cancelled",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid booking status.",
        },
        { status: 400 }
      );
    }

    const { data: existingBooking, error: fetchError } =
      await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !existingBooking) {
      console.error("ÀTÚNBÍ BOOKING FETCH ERROR:", fetchError);

      return NextResponse.json(
        {
          success: false,
          message: "Booking could not be found.",
        },
        { status: 404 }
      );
    }

    if (existingBooking.status === status) {
      return NextResponse.json({
        success: true,
        message: "Booking status unchanged.",
        booking: existingBooking,
        emailSent: false,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "ÀTÚNBÍ BOOKING STATUS UPDATE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message || "Unable to update booking.",
          code: error.code || null,
          details: error.details || null,
          hint: error.hint || null,
        },
        { status: 500 }
      );
    }

    const notifications: Record<
      string,
      {
        subject: string;
        title: string;
        message: string;
      }
    > = {
      pending: {
        subject:
          "ÀTÚNBÍ Entertainment — Booking Status Update",
        title: "Booking Status Updated",
        message:
          "Your booking request is currently pending review.",
      },
      contacted: {
        subject:
          "ÀTÚNBÍ Entertainment — We Have Contacted You",
        title: "We Have Contacted You",
        message:
          "Our team has reviewed your booking request and has contacted you regarding your booking.",
      },
      confirmed: {
        subject:
          "ÀTÚNBÍ Entertainment — Booking Confirmed",
        title: "Booking Confirmed",
        message:
          "Great news! Your booking with ÀTÚNBÍ Entertainment has been confirmed.",
      },
      completed: {
        subject:
          "ÀTÚNBÍ Entertainment — Booking Completed",
        title: "Booking Completed",
        message:
          "Your ÀTÚNBÍ Entertainment booking has been marked as completed. Thank you for choosing us.",
      },
      cancelled: {
        subject:
          "ÀTÚNBÍ Entertainment — Booking Cancelled",
        title: "Booking Cancelled",
        message:
          "Your booking with ÀTÚNBÍ Entertainment has been marked as cancelled. Please contact us if you have any questions.",
      },
      rejected: {
        subject:
          "ÀTÚNBÍ Entertainment — Booking Update",
        title: "Booking Update",
        message:
          "There has been an update to your ÀTÚNBÍ Entertainment booking request. Please contact us for further information.",
      },
    };

    const notification = notifications[status];
    let emailSent = false;

    if (notification && existingBooking.email) {
      const formattedDate = new Date(
        `${existingBooking.event_date}T00:00:00`
      ).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const emailHtml = layout(`
<h1 style="margin:0;font-size:30px;line-height:38px;color:#17130F;">
${escapeHtml(notification.title)}
</h1>
<p style="margin:18px 0 0;font-size:16px;line-height:26px;color:#51483E;">
Hello <strong>${escapeHtml(existingBooking.client_name)}</strong>,
</p>
<p style="margin:16px 0 0;font-size:15px;line-height:25px;color:#51483E;">
${escapeHtml(notification.message)}
</p>
<div style="margin:28px 0;padding:18px;border-radius:14px;background:#F7F1E3;border-left:4px solid #D8B45A;">
<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#A47B22;">
Current Status
</div>
<div style="margin-top:6px;font-size:18px;font-weight:800;color:#17130F;">
${escapeHtml(status.charAt(0).toUpperCase() + status.slice(1))}
</div>
</div>
<h2 style="font-size:18px;color:#17130F;">Booking Details</h2>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
${row("Event", existingBooking.event_type)}
${row("Date", formattedDate)}
${row("Location", existingBooking.event_location)}
${row("Booking ID", existingBooking.id)}
</table>
<p style="margin-top:28px;font-size:15px;line-height:25px;color:#51483E;">
If you have any questions, please contact ÀTÚNBÍ Entertainment.
</p>
<p style="margin-top:22px;font-weight:700;color:#17130F;">
Thank you for choosing ÀTÚNBÍ Entertainment.
</p>
`);

      const emailText =
        `ÀTÚNBÍ Entertainment\n\n` +
        `${notification.title}\n\n` +
        `Hello ${existingBooking.client_name},\n\n` +
        `${notification.message}\n\n` +
        `BOOKING DETAILS\n\n` +
        `Event: ${existingBooking.event_type}\n` +
        `Date: ${formattedDate}\n` +
        `Location: ${existingBooking.event_location}\n` +
        `Booking ID: ${existingBooking.id}\n\n` +
        `CURRENT STATUS:\n${status.toUpperCase()}\n\n` +
        `If you have any questions, please contact ÀTÚNBÍ Entertainment.\n\n` +
        `Thank you for choosing ÀTÚNBÍ Entertainment.\n\n` +
        `musicatunbi@gmail.com`;

      try {
        const emailResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: [existingBooking.email],
          subject: notification.subject,
          html: emailHtml,
          text: emailText,
        });

        if (emailResult.error) {
          console.error(
            "ÀTÚNBÍ STATUS EMAIL ERROR:",
            emailResult.error
          );
        } else {
          emailSent = true;
          console.log(
            "ÀTÚNBÍ STATUS EMAIL SENT:",
            status,
            existingBooking.email
          );
        }
      } catch (emailError) {
        console.error(
          "ÀTÚNBÍ STATUS EMAIL EXCEPTION:",
          emailError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Booking status updated and notification email sent."
        : "Booking status updated, but notification email could not be sent.",
      booking: data,
      emailSent,
    });
  } catch (error) {
    console.error("ÀTÚNBÍ PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update booking.",
      },
      { status: 500 }
    );
  }
}