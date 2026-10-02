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

function getConfiguredPartner(slug: string) {
  const partner = affiliatePartners.find(
    (item) => item.id === slug && item.active
  );

  if (!partner) {
    return null;
  }

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
 * Flow:
 * 1. Validate the HnC-configured partner.
 * 2. Resolve the partner against affiliate_partners using its slug.
 * 3. Use the database UUID as affiliate_clicks.partner_id.
 * 4. Record the click.
 * 5. Redirect to the server-controlled destination.
 *
 * Security:
 * - No arbitrary destination URL is accepted.
 * - Only configured HnC partners can be tracked.
 * - Anonymous clicks are allowed.
 * - Authenticated member IDs are recorded when available.
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

    /*
     * First resolve the partner from the controlled
     * application configuration.
     *
     * This prevents arbitrary database rows from becoming
     * outbound destinations.
     */
    const configured = getConfiguredPartner(slug);

    if (!configured) {
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

    /*
     * Now resolve the real database partner.
     *
     * affiliate_clicks.partner_id is a UUID foreign key,
     * so we must use affiliate_partners.id rather than
     * the human-readable partner slug.
     */
    const { data: databasePartner, error: partnerError } =
      await supabaseAdmin
        .from("affiliate_partners")
        .select("id, slug, name, active")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

    if (partnerError) {
      console.error(
        "Affiliate partner lookup error:",
        partnerError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "HnC could not verify this affiliate partner.",
        },
        {
          status: 500,
        }
      );
    }

    if (!databasePartner) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This affiliate partner is not registered in HnC.",
        },
        {
          status: 404,
        }
      );
    }

    const userId = await getOptionalUserId(request);

    const referrer =
      request.headers.get("referer")?.slice(0, 1000) ||
      null;

    /*
     * Record the click using the database UUID.
     */
    const { data: click, error: clickError } =
      await supabaseAdmin
        .from("affiliate_clicks")
        .insert({
          partner_id: databasePartner.id,
          user_id: userId,
          destination: configured.destination,
          referrer,
        })
        .select(
          "id, partner_id, user_id, clicked_at, destination, referrer"
        )
        .single();

    if (clickError) {
      console.error(
        "Affiliate click tracking error:",
        clickError
      );

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
      configured.destination,
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