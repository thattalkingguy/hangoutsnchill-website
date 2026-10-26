
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { affiliatePartners } from "@/app/lib/affiliatePartners";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function cleanSlug(value: string | null): string | null {
  if (!value) return null;

  const slug = value.trim().toLowerCase();

  return /^[a-z0-9-]{1,80}$/.test(slug) ? slug : null;
}

function cleanPathway(value: string | null): string | null {
  if (!value) return null;

  const pathway = value.trim().toLowerCase();

  return /^[a-z0-9-]{1,40}$/.test(pathway) ? pathway : null;
}

function getConfiguredPartner(slug: string, pathway: string | null) {
  const partner = affiliatePartners.find(
    (item) => item.id === slug && item.active
  );

  if (!partner) return null;

  let destination: string | undefined;
  let resolvedPathway: string | null = null;

  if (slug === "deriv") {
    if (!pathway || pathway === "customer") {
      destination = partner.affiliateUrl;
      resolvedPathway = "customer";
    } else if (pathway === "partners") {
      destination = partner.partnerUrl;
      resolvedPathway = "partners";
    } else {
      return null;
    }
  } else {
    // Other partners do not accept a pathway parameter.
    if (pathway) return null;

    // A programme application page is NOT a commission referral link.
    // Require an actual affiliate URL for tracked redirects.
    destination = partner.affiliateUrl;
  }

  if (!destination) return null;

  try {
    const parsed = new URL(destination);

    if (
      !ALLOWED_PROTOCOLS.has(parsed.protocol) ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      return null;
    }

    return {
      partner,
      destination: parsed.toString(),
      pathway: resolvedPathway,
    };
  } catch {
    return null;
  }
}

async function getOptionalUserId(request: Request): Promise<string | null> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) return null;

  const accessToken = authorization.slice("Bearer ".length).trim();

  if (!accessToken) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) return null;

    return user.id;
  } catch (error) {
    console.error("Optional affiliate user lookup failed:", error);
    return null;
  }
}

function getReferrerOrigin(request: Request): string | null {
  const refererHeader = request.headers.get("referer");

  if (!refererHeader) return null;

  try {
    const parsed = new URL(refererHeader);

    if (
      !ALLOWED_PROTOCOLS.has(parsed.protocol) ||
      !parsed.hostname
    ) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const slug = cleanSlug(requestUrl.searchParams.get("partner"));
    const pathway = cleanPathway(requestUrl.searchParams.get("pathway"));

    if (!slug) {
      return errorResponse("A valid affiliate partner is required.", 400);
    }

    if (requestUrl.searchParams.has("pathway") && !pathway) {
      return errorResponse("The affiliate pathway is invalid.", 400);
    }

    const configured = getConfiguredPartner(slug, pathway);

    if (!configured) {
      return errorResponse(
        "This partner is inactive or has no valid affiliate referral URL.",
        409
      );
    }

    // The partner must be active in both the code registry and database.
    const { data: databasePartner, error: partnerError } =
      await supabaseAdmin
        .from("affiliate_partners")
        .select("id, slug, name, active")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

    if (partnerError) {
      console.error("Affiliate partner lookup error:", partnerError);

      return errorResponse(
        "HnC could not verify this affiliate partner.",
        500
      );
    }

    if (!databasePartner) {
      return errorResponse(
        "This affiliate partner is not registered and active in HnC.",
        404
      );
    }

    const userId = await getOptionalUserId(request);
    const referrer = getReferrerOrigin(request);

    // Preserve the existing affiliate_clicks database schema.
    const { error: clickError } = await supabaseAdmin
      .from("affiliate_clicks")
      .insert({
        partner_id: databasePartner.id,
        user_id: userId,
        destination: configured.destination,
        referrer,
      });

    if (clickError) {
      console.error("Affiliate click tracking error:", clickError);

      // Do not redirect if the click could not be recorded.
      return errorResponse(
        "HnC could not record this click. Please try again.",
        500
      );
    }

    return NextResponse.redirect(configured.destination, {
      status: 302,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Affiliate click route error:", error);

    return errorResponse("Unable to process affiliate click.", 500);
  }
}
