import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAdminUser(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.substring(7);

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
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

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    /*
     * Treasury settings are stored in a dedicated table.
     *
     * We intentionally return only the settings needed by
     * the admin control panel.
     */

    const { data, error } = await supabaseAdmin
      .from("platform_treasury_settings")
      .select(
        "id,preferred_asset,auto_convert_enabled,withdrawals_enabled,updated_at"
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Treasury settings lookup failed:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to load treasury settings.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings:
        data || {
          preferred_asset: "USDT",
          auto_convert_enabled: false,
          withdrawals_enabled: false,
        },
    });
  } catch (error) {
    console.error(
      "Treasury settings GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load treasury settings.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Administrator access required.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();

    const preferredAsset = String(
      body.preferredAsset || ""
    )
      .trim()
      .toUpperCase();

    const autoConvertEnabled =
      body.autoConvertEnabled === true;

    /*
     * Treasury withdrawals remain deliberately disabled
     * until production provider/compliance setup is complete.
     *
     * The client cannot enable this through this endpoint.
     */

    const withdrawalsEnabled = false;

    if (!preferredAsset) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a preferred treasury asset.",
        },
        { status: 400 }
      );
    }

    /*
     * Confirm the selected asset exists and is enabled.
     */

    const { data: asset, error: assetError } =
      await supabaseAdmin
        .from("supported_assets")
        .select(
          "symbol,asset_type,enabled,exchange_enabled"
        )
        .eq("symbol", preferredAsset)
        .eq("enabled", true)
        .maybeSingle();

    if (assetError) {
      console.error(
        "Treasury asset lookup failed:",
        assetError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to validate treasury asset.",
        },
        { status: 500 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          message:
            `${preferredAsset} is not an enabled HnC asset.`,
        },
        { status: 400 }
      );
    }

    /*
     * We require exchange_enabled for a preferred asset
     * because future treasury consolidation will need an
     * approved exchange route.
     */

    if (!asset.exchange_enabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            `${preferredAsset} is not enabled for exchange.`,
        },
        { status: 400 }
      );
    }

    /*
     * Check whether the settings row already exists.
     */

    const {
      data: existing,
      error: existingError,
    } = await supabaseAdmin
      .from("platform_treasury_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(
        "Treasury settings existence check failed:",
        existingError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to access treasury settings.",
        },
        { status: 500 }
      );
    }

    let saved;

    if (existing?.id) {
      const { data, error } =
        await supabaseAdmin
          .from("platform_treasury_settings")
          .update({
            preferred_asset: preferredAsset,
            auto_convert_enabled:
              autoConvertEnabled,
            withdrawals_enabled:
              withdrawalsEnabled,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select(
            "id,preferred_asset,auto_convert_enabled,withdrawals_enabled,updated_at"
          )
          .single();

      if (error) {
        console.error(
          "Treasury settings update failed:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to save treasury settings.",
          },
          { status: 500 }
        );
      }

      saved = data;
    } else {
      const { data, error } =
        await supabaseAdmin
          .from("platform_treasury_settings")
          .insert({
            preferred_asset: preferredAsset,
            auto_convert_enabled:
              autoConvertEnabled,
            withdrawals_enabled:
              withdrawalsEnabled,
          })
          .select(
            "id,preferred_asset,auto_convert_enabled,withdrawals_enabled,updated_at"
          )
          .single();

      if (error) {
        console.error(
          "Treasury settings insert failed:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to create treasury settings.",
          },
          { status: 500 }
        );
      }

      saved = data;
    }

    return NextResponse.json({
      success: true,
      message: "Treasury settings saved successfully.",
      settings: saved,
    });
  } catch (error) {
    console.error(
      "Treasury settings PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save treasury settings.",
      },
      { status: 500 }
    );
  }
}