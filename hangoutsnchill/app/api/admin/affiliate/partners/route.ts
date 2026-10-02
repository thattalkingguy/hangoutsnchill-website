import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server environment variables."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getAdminUser(request: Request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization
    .slice("Bearer ".length)
    .trim();

  if (!accessToken) {
    return null;
  }

  const supabase = getAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    return null;
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, role, verified, full_name"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  if (
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

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function cleanSlug(value: unknown) {
  const valueString = cleanString(value);

  if (!valueString) {
    return null;
  }

  const slug = valueString.toLowerCase();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  return slug;
}

function cleanBoolean(
  value: unknown,
  fallback = true
) {
  if (typeof value === "boolean") {
    return value;
  }

  return fallback;
}

function cleanRoute(value: unknown) {
  const route = cleanString(value);

  if (!route) {
    return null;
  }

  if (!route.startsWith("/")) {
    return null;
  }

  if (route.startsWith("//")) {
    return null;
  }

  return route;
}

/*
 * GET
 *
 * Returns all registered HnC affiliate partners.
 *
 * Admin only.
 */
export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const supabase = getAdminClient();

    const {
      data: partners,
      error,
    } = await supabase
      .from("affiliate_partners")
      .select(
        `
          id,
          slug,
          name,
          category,
          description,
          route,
          active,
          created_at
        `
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Affiliate partners GET error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not load affiliate partners.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      partners: partners || [],
      count: partners?.length || 0,
    });
  } catch (error) {
    console.error(
      "Affiliate partners GET unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected affiliate partner error.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * POST
 *
 * Creates a new affiliate partner.
 *
 * New partners are inactive by default unless
 * explicitly activated by an admin.
 */
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const slug = cleanSlug(body?.slug);
    const name = cleanString(body?.name);
    const category = cleanString(body?.category);
    const description =
      cleanString(body?.description);
    const route = cleanRoute(body?.route);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Partner slug is required and may only contain lowercase letters, numbers, and hyphens.",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Partner name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Partner category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!route) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid internal HnC route is required.",
        },
        {
          status: 400,
        }
      );
    }

    const active = cleanBoolean(
      body?.active,
      false
    );

    const supabase = getAdminClient();

    /*
     * Prevent duplicate partner slugs.
     */
    const {
      data: existingPartner,
      error: existingError,
    } = await supabase
      .from("affiliate_partners")
      .select("id, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Affiliate partner duplicate check failed:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not validate the affiliate partner.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingPartner) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An affiliate partner with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: partner,
      error,
    } = await supabase
      .from("affiliate_partners")
      .insert({
        slug,
        name,
        category,
        description,
        route,
        active,
      })
      .select(
        `
          id,
          slug,
          name,
          category,
          description,
          route,
          active,
          created_at
        `
      )
      .single();

    if (error || !partner) {
      console.error(
        "Affiliate partner POST error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not create affiliate partner.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Affiliate partner created successfully.",
        partner,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Affiliate partners POST unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected affiliate partner error.",
      },
      {
        status: 400,
      }
    );
  }
}

/*
 * PATCH
 *
 * Updates an existing affiliate partner.
 *
 * Supported fields:
 * - slug
 * - name
 * - category
 * - description
 * - route
 * - active
 */
export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const id = cleanString(body?.id);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Affiliate partner ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const updates: Record<
      string,
      unknown
    > = {};

    if (body?.slug !== undefined) {
      const slug = cleanSlug(body.slug);

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid partner slug.",
          },
          {
            status: 400,
          }
        );
      }

      updates.slug = slug;
    }

    if (body?.name !== undefined) {
      const name = cleanString(body.name);

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Partner name cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      updates.name = name;
    }

    if (body?.category !== undefined) {
      const category =
        cleanString(body.category);

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Partner category cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      updates.category = category;
    }

    if (body?.description !== undefined) {
      updates.description =
        cleanString(body.description);
    }

    if (body?.route !== undefined) {
      const route = cleanRoute(body.route);

      if (!route) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Partner route must be a valid internal HnC path.",
          },
          {
            status: 400,
          }
        );
      }

      updates.route = route;
    }

    if (body?.active !== undefined) {
      if (
        typeof body.active !== "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Partner active status must be true or false.",
          },
          {
            status: 400,
          }
        );
      }

      updates.active = body.active;
    }

    if (
      Object.keys(updates).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No valid partner changes were supplied.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = getAdminClient();

    /*
     * Prevent duplicate slugs when changing
     * an existing partner's slug.
     */
    if (typeof updates.slug === "string") {
      const {
        data: duplicate,
        error: duplicateError,
      } = await supabase
        .from("affiliate_partners")
        .select("id, slug")
        .eq("slug", updates.slug)
        .neq("id", id)
        .maybeSingle();

      if (duplicateError) {
        console.error(
          "Affiliate partner slug check failed:",
          duplicateError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Could not validate partner slug.",
          },
          {
            status: 500,
          }
        );
      }

      if (duplicate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Another affiliate partner already uses this slug.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const {
      data: partner,
      error,
    } = await supabase
      .from("affiliate_partners")
      .update(updates)
      .eq("id", id)
      .select(
        `
          id,
          slug,
          name,
          category,
          description,
          route,
          active,
          created_at
        `
      )
      .single();

    if (error || !partner) {
      console.error(
        "Affiliate partner PATCH error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not update affiliate partner.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Affiliate partner updated successfully.",
      partner,
    });
  } catch (error) {
    console.error(
      "Affiliate partners PATCH unexpected error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected affiliate partner error.",
      },
      {
        status: 400,
      }
    );
  }
}