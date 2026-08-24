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
  process.env.BOOKING_ADMIN_EMAIL ||
  "musicatunbi@gmail.com";

const FROM_EMAIL =
  process.env.BOOKING_FROM_EMAIL ||
  "ÀTÚNBÍ Entertainment <onboarding@resend.dev>";

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

<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #D8B45A33;">

<tr>
<td style="background:#17130F;padding:32px 34px;text-align:center;">

<div style="font-size:12px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:#D8B45A;">
ÀTÚNBÍ
</div>

<div style="margin-top:8px;font-size:14px;letter-spacing:2px;color:#F7F1E3;">
ENTERTAINMENT
</div>

</td>
</tr>

<tr>
<td style="padding:36px 34px;">
${content}
</td>
</tr>

<tr>
<td style="background:#17130F;padding:26px 34px;text-align:center;">

<div style="font-size:14px;font-weight:700;color:#D8B45A;">
ÀTÚNBÍ Entertainment
</div>

<div style="margin-top:8px;font-size:12px;line-height:20px;color:#CFC6B8;">
musicatunbi@gmail.com
</div>

<div style="margin-top:8px;font-size:11px;line-height:18px;color:#8F8578;">
© 2026 ÀTÚNBÍ Entertainment. All rights reserved.
</div>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;


function formatEventDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


/* =========================================================
   POST — PUBLIC BOOKING SUBMISSION
   ========================================================= */

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

    /*
     * Validate required booking fields.
     */

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

    /*
     * Save booking to Supabase.
     */

    const booking = {
      client_name: clientName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      event_type: eventType.trim(),
      event_date: eventDate,
      event_location: eventLocation.trim(),
      venue: venue?.trim() || null,
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
      console.error(
        "ÀTÚNBÍ BOOKING SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Unable to save booking request.",
          code: error.code || null,
          details: error.details || null,
          hint: error.hint || null,
        },
        { status: 500 }
      );
    }

    const formattedDate = formatEventDate(
      booking.event_date
    );


    /* =========================================================
       CLIENT EMAIL

       IMPORTANT:
       NO admin dashboard information here.
       ========================================================= */

    const clientContent = `

<h1 style="
margin:0;
font-size:30px;
line-height:38px;
font-weight:800;
color:#17130F;
">
Booking Request Received
</h1>

<p style="
margin:18px 0 0;
font-size:16px;
line-height:26px;
color:#51483E;
">
Hello <strong>${escapeHtml(
      booking.client_name
    )}</strong>,
</p>

<p style="
margin:14px 0 0;
font-size:15px;
line-height:25px;
color:#51483E;
">
Thank you for choosing ÀTÚNBÍ Entertainment.
Your booking request has been received successfully.
</p>

<div style="
margin:26px 0;
padding:16px 18px;
border-radius:14px;
background:#F7F1E3;
border-left:4px solid #D8B45A;
">

<div style="
font-size:11px;
font-weight:700;
text-transform:uppercase;
letter-spacing:1.5px;
color:#A47B22;
">
Current Status
</div>

<div style="
margin-top:6px;
font-size:17px;
font-weight:800;
color:#17130F;
">
Pending Review
</div>

</div>

<h2 style="
margin:28px 0 8px;
font-size:18px;
color:#17130F;
">
Your Booking Details
</h2>

<table width="100%" cellpadding="0" cellspacing="0" border="0">

${row("Event", booking.event_type)}

${row("Date", formattedDate)}

${row("Location", booking.event_location)}

${row(
      "Venue",
      booking.venue || "Not specified"
    )}

${row(
      "Guests",
      booking.guests
        ? String(booking.guests)
        : "Not specified"
    )}

${row(
      "Duration",
      booking.duration || "Not specified"
    )}

${row(
      "Budget",
      booking.budget || "Not specified"
    )}

${row("Booking ID", data.id)}

</table>

${
  booking.requirements
    ? `
<div style="margin-top:24px;">

<div style="
font-size:11px;
font-weight:700;
text-transform:uppercase;
letter-spacing:1.5px;
color:#A47B22;
">
Special Requirements
</div>

<div style="
margin-top:8px;
padding:16px;
background:#F7F1E3;
border-radius:12px;
font-size:14px;
line-height:23px;
color:#51483E;
">
${escapeHtml(booking.requirements)}
</div>

</div>
`
    : ""
}

${
  booking.message
    ? `
<div style="margin-top:24px;">

<div style="
font-size:11px;
font-weight:700;
text-transform:uppercase;
letter-spacing:1.5px;
color:#A47B22;
">
Your Message
</div>

<div style="
margin-top:8px;
padding:16px;
background:#F7F1E3;
border-radius:12px;
font-size:14px;
line-height:23px;
color:#51483E;
">
${escapeHtml(booking.message)}
</div>

</div>
`
    : ""
}

<p style="
margin:28px 0 0;
font-size:15px;
line-height:25px;
color:#51483E;
">
Our team will review your request and contact you
regarding availability, terms and booking confirmation.
</p>

<p style="
margin:22px 0 0;
font-size:15px;
line-height:25px;
color:#17130F;
font-weight:700;
">
Thank you for choosing ÀTÚNBÍ Entertainment.
</p>

`;


    /* =========================================================
       ADMIN EMAIL

       THIS is the ONLY email containing dashboard information.
       ========================================================= */

    const adminContent = `

<div style="
display:inline-block;
padding:7px 12px;
border-radius:999px;
background:#17130F;
color:#D8B45A;
font-size:10px;
font-weight:800;
letter-spacing:1.5px;
text-transform:uppercase;
">
New Booking Request
</div>

<h1 style="
margin:18px 0 0;
font-size:29px;
line-height:37px;
font-weight:800;
color:#17130F;
">
New ÀTÚNBÍ Booking
</h1>

<p style="
margin:12px 0 0;
font-size:15px;
line-height:24px;
color:#51483E;
">
A new entertainment booking request has been
submitted through the website.
</p>

<h2 style="
margin:28px 0 8px;
font-size:18px;
color:#17130F;
">
Client Information
</h2>

<table width="100%" cellpadding="0" cellspacing="0" border="0">

${row("Name", booking.client_name)}

${row("Phone", booking.phone)}

${row("Email", booking.email)}

</table>

<h2 style="
margin:28px 0 8px;
font-size:18px;
color:#17130F;
">
Event Information
</h2>

<table width="100%" cellpadding="0" cellspacing="0" border="0">

${row("Event", booking.event_type)}

${row("Date", formattedDate)}

${row("Location", booking.event_location)}

${row(
      "Venue",
      booking.venue || "Not specified"
    )}

${row(
      "Guests",
      booking.guests
        ? String(booking.guests)
        : "Not specified"
    )}

${row(
      "Duration",
      booking.duration || "Not specified"
    )}

${row(
      "Budget",
      booking.budget || "Not specified"
    )}

${row("Status", "Pending")}

${row("Booking ID", data.id)}

</table>

${
  booking.requirements
    ? `
<div style="margin-top:24px;">

<div style="
font-size:11px;
font-weight:700;
text-transform:uppercase;
letter-spacing:1.5px;
color:#A47B22;
">
Special Requirements
</div>

<div style="
margin-top:8px;
padding:16px;
background:#F7F1E3;
border-radius:12px;
font-size:14px;
line-height:23px;
color:#51483E;
">
${escapeHtml(booking.requirements)}
</div>

</div>
`
    : ""
}

${
  booking.message
    ? `
<div style="margin-top:24px;">

<div style="
font-size:11px;
font-weight:700;
text-transform:uppercase;
letter-spacing:1.5px;
color:#A47B22;
">
Client Message
</div>

<div style="
margin-top:8px;
padding:16px;
background:#F7F1E3;
border-radius:12px;
font-size:14px;
line-height:23px;
color:#51483E;
">
${escapeHtml(booking.message)}
</div>

</div>
`
    : ""
}

<div style="
margin-top:30px;
padding:16px;
background:#F7F1E3;
border-radius:14px;
font-size:13px;
line-height:22px;
color:#51483E;
">

<strong>Admin Action</strong>

<br/><br/>

Please log in to the ÀTÚNBÍ Entertainment admin
dashboard to review and manage this booking.

</div>

`;


    /* =========================================================
       SEND EXACTLY TWO EMAILS

       1. Client → client email
       2. Admin → admin email

       They are completely separate.
       ========================================================= */

    const clientEmail = await resend.emails.send({
      from: FROM_EMAIL,
      to: [booking.email],
      subject:
        "ÀTÚNBÍ Entertainment — Booking Request Received",
      html: layout(clientContent),
      text:
        `Hello ${booking.client_name},\n\n` +
        "Thank you for choosing ÀTÚNBÍ Entertainment.\n\n" +
        "Your booking request has been received successfully.\n\n" +
        "BOOKING DETAILS\n\n" +
        `Event: ${booking.event_type}\n` +
        `Date: ${formattedDate}\n` +
        `Location: ${booking.event_location}\n` +
        `Venue: ${booking.venue || "Not specified"}\n` +
        `Guests: ${booking.guests ?? "Not specified"}\n` +
        `Duration: ${booking.duration || "Not specified"}\n` +
        `Budget: ${booking.budget || "Not specified"}\n` +
        `Booking ID: ${data.id}\n\n` +
        "Status: Pending Review\n\n" +
        "Our team will review your request and contact you regarding availability, terms and booking confirmation.\n\n" +
        "ÀTÚNBÍ Entertainment\n" +
        "musicatunbi@gmail.com",
    });

    if (clientEmail.error) {
      console.error(
        "ÀTÚNBÍ CLIENT EMAIL ERROR:",
        clientEmail.error
      );
    }


    const adminEmail = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL.trim()],
      subject:
        "New ÀTÚNBÍ Entertainment Booking Request",
      html: layout(adminContent),
      text:
        "NEW ÀTÚNBÍ ENTERTAINMENT BOOKING\n\n" +
        "CLIENT\n" +
        `Name: ${booking.client_name}\n` +
        `Phone: ${booking.phone}\n` +
        `Email: ${booking.email}\n\n` +
        "EVENT\n" +
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
        "STATUS: Pending\n\n" +
        "Please log in to the ÀTÚNBÍ Entertainment admin dashboard to review and manage this booking.",
    });

    if (adminEmail.error) {
      console.error(
        "ÀTÚNBÍ ADMIN EMAIL ERROR:",
        adminEmail.error
      );
    }


    /*
     * IMPORTANT:
     * The booking is already safely stored.
     *
     * We therefore return success even if Resend
     * temporarily reports an email problem.
     */

    return NextResponse.json({
      success: true,
      bookingSaved: true,
      emailsSent: !clientEmail.error && !adminEmail.error,
      message:
        "Booking request received. Thank you. ÀTÚNBÍ Entertainment will review your request and respond with availability, terms and booking details.",
      booking: data,
    });

  } catch (error) {

    console.error(
      "ÀTÚNBÍ PUBLIC BOOKING API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your booking request.",
      },
      { status: 500 }
    );
  }
}


/* =========================================================
   GET — ADMIN MANAGEMENT
   ========================================================= */

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "ÀTÚNBÍ ADMIN BOOKINGS GET ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Unable to load bookings.",
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

    console.error(
      "ÀTÚNBÍ ADMIN BOOKINGS GET EXCEPTION:",
      error
    );

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


/* =========================================================
   PATCH — ADMIN BOOKING STATUS
   ========================================================= */

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking ID and status are required.",
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
            error.message ||
            "Unable to update booking.",
          code: error.code || null,
          details: error.details || null,
          hint: error.hint || null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking status updated.",
      booking: data,
    });

  } catch (error) {

    console.error(
      "ÀTÚNBÍ PATCH ERROR:",
      error
    );

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