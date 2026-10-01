import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { affiliatePartners } from "@/app/lib/affiliatePartners";

function cleanSlug(value: string | null) {
  if (!value) {
    return null;
  }

  const slug = value.trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  return slug;
}

function getControlledDestination(slug: string) {
  const partner = affiliatePartners.find(
    (item) => item.id === slug && item.active
  );

  if (!partner) {
    return null;
  }

  /*
   * Commercial affiliate URL takes priority.
   *
   * programUrl is used only when HnC does not yet have
   * an approved affiliate referral URL for the partner.
   */
  const destination =
    partner.affiliateUrl || partner.programUrl || null;

  if (!destination) {
    return null;
  }

  try {
    const parsed = new URL(destination);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return {
      partner,
      destination: parsed.toString(),
    };
  } catch {
    return null;
  }
}

async function getOptionalUserId(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization
    .slice("Bearer ".length)
    .trim();

  if (!accessToken) {
    return null;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch {
    return null;
  }
}

/*
 * GET /api/affiliate/click?partner=mtn-eshop
 *
 * Public affiliate/program click tracker.
 *
 * Security:
 * - partner must be a known HnC partner
 * - destination is resolved server-side
 * - arbitrary redirect URLs are never accepted
 * - anonymous clicks are allowed
 * - authenticated member IDs are recorded when available
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const slug = cleanSlug(
      searchParams.get("partner")
    );

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid affiliate partner is required.",
        },
        {
          status: 400,
        }
      );
    }

    const resolved = getControlledDestination(slug);

    if (!resolved) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This affiliate partner is not currently configured for outbound tracking.",
        },
        {
          status: 409,
        }
      );
    }

    const userId = await getOptionalUserId(request);

    const referrer =
      request.headers.get("referer")?.slice(0, 1000) ||
      null;

    const { error: clickError } =
      await supabaseAdmin
        .from("affiliate_clicks")
        .insert({
          partner_id: resolved.partner.id,
          user_id: userId,
          destination: resolved.destination,
          referrer,
        });

    if (clickError) {
      console.error(
        "Affiliate click tracking error:",
        clickError
      );

      /*
       * Do not send the visitor to the partner if HnC
       * failed to record the commercial click.
       *
       * This keeps the first version conservative and
       * prevents untracked outbound commercial traffic.
       */
      return NextResponse.json(
        {
          success: false,
          error:
            "HnC could not record this partner click. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.redirect(
      resolved.destination,
      302
    );
  } catch (error) {
    console.error(
      "Affiliate click route unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to process affiliate partner click.",
      },
      {
        status: 500,
      }
    );
  }
}