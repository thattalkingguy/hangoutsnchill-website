import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type SubmissionBody = {
  type?: "callback" | "complaint";
  company_slug?: string;
  requester_name?: string;
  requester_phone?: string;
  category?: string;
  subject?: string;
  message?: string;
  preferred_contact_method?: "phone" | "email" | "whatsapp" | "in_app";
  preferred_callback_at?: string | null;
  contact_consent?: boolean;
};

const COMPLAINT_CATEGORIES = [
  "poor_customer_service",
  "unanswered_call",
  "unreturned_call",
  "unresolved_enquiry",
  "billing",
  "product_or_service",
  "staff_conduct",
  "general",
];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Server database configuration is incomplete.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim() || null;
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please log in before submitting a request." },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Your session is invalid or has expired. Please log in again." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SubmissionBody;

    const type = body.type;
    const companySlug = cleanText(body.company_slug, 180);
    const requesterName = cleanText(body.requester_name, 100);
    const requesterPhone = cleanText(body.requester_phone, 40);
    const message = cleanText(body.message, 5000);

    if (type !== "callback" && type !== "complaint") {
      return NextResponse.json(
        { success: false, message: "Invalid Customer First request type." },
        { status: 400 }
      );
    }

    if (!companySlug || !requesterName || requesterName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Company and a valid name are required." },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { success: false, message: "Please provide more information about your request." },
        { status: 400 }
      );
    }

    const { data: company, error: companyError } = await supabase
      .from("hnc_company_directory")
      .select("id, company_name")
      .eq("slug", companySlug)
      .eq("listing_status", "published")
      .maybeSingle();

    if (companyError) {
      console.error("Customer First company lookup failed:", companyError.message);

      return NextResponse.json(
        { success: false, message: "Unable to verify this company right now." },
        { status: 500 }
      );
    }

    if (!company) {
      return NextResponse.json(
        { success: false, message: "This company listing is unavailable." },
        { status: 404 }
      );
    }

    const requesterEmail = user.email || null;

    if (type === "callback") {
      const contactMethod = body.preferred_contact_method || "phone";

      if (!["phone", "email", "whatsapp", "in_app"].includes(contactMethod)) {
        return NextResponse.json(
          { success: false, message: "Please select a valid contact method." },
          { status: 400 }
        );
      }

      if (
        (contactMethod === "phone" || contactMethod === "whatsapp") &&
        requesterPhone.length < 7
      ) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid phone number." },
          { status: 400 }
        );
      }

      if (contactMethod === "email" && (!requesterEmail || !validEmail(requesterEmail))) {
        return NextResponse.json(
          { success: false, message: "Your account must have a valid email address for email contact." },
          { status: 400 }
        );
      }

      if (body.contact_consent !== true) {
        return NextResponse.json(
          { success: false, message: "Please confirm that you agree to be contacted about this request." },
          { status: 400 }
        );
      }

      let preferredCallbackAt: string | null = null;

      if (body.preferred_callback_at) {
        const callbackDate = new Date(body.preferred_callback_at);

        if (Number.isNaN(callbackDate.getTime())) {
          return NextResponse.json(
            { success: false, message: "The preferred callback date is invalid." },
            { status: 400 }
          );
        }

        if (callbackDate.getTime() < Date.now()) {
          return NextResponse.json(
            { success: false, message: "Please choose a future callback time." },
            { status: 400 }
          );
        }

        preferredCallbackAt = callbackDate.toISOString();
      }

      const { data: enquiry, error: insertError } = await supabase
        .from("hnc_company_enquiries")
        .insert({
          company_id: company.id,
          requester_id: user.id,
          requester_name: requesterName,
          requester_email: requesterEmail,
          requester_phone: requesterPhone || null,
          enquiry_type: "request_callback",
          message,
          preferred_contact_method: contactMethod,
          preferred_callback_at: preferredCallbackAt,
          contact_consent_at: new Date().toISOString(),
          status: "submitted",
          notification_status: "not_configured",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Customer First callback submission failed:", insertError.message);

        return NextResponse.json(
          { success: false, message: "Your callback request could not be saved. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        request_id: enquiry.id,
        message:
          "Your callback request has been saved. Automatic company notification is not yet connected, so the company has not been notified by HnC.",
      });
    }

    const category = cleanText(body.category, 60);
    const subject = cleanText(body.subject, 160);

    if (!COMPLAINT_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Please select a valid complaint category." },
        { status: 400 }
      );
    }

    if (subject.length < 3) {
      return NextResponse.json(
        { success: false, message: "Please provide a complaint subject." },
        { status: 400 }
      );
    }

    const { data: complaint, error: complaintError } = await supabase
      .from("hnc_customer_complaints")
      .insert({
        company_id: company.id,
        requester_id: user.id,
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_phone: requesterPhone || null,
        category,
        subject,
        message,
        status: "submitted",
      })
      .select("id")
      .single();

    if (complaintError) {
      console.error("Customer First complaint submission failed:", complaintError.message);

      return NextResponse.json(
        { success: false, message: "Your complaint could not be saved. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      complaint_id: complaint.id,
      message:
        "Your complaint has been recorded by HnC. Automatic company notification is not yet connected, so the company has not been notified by HnC.",
    });
  } catch (error) {
    console.error(
      "Customer First API error:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}