import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase server environment variables."
  );
}

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("membership_plans")
      .select(
        `
          id,
          name,
          slug,
          description,
          billing_interval,
          price,
          currency,
          active
        `
      )
      .eq("active", true)
      .order("price", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Unable to load membership plans:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load membership plans.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      plans: data ?? [],
    });
  } catch (error) {
    console.error(
      "Membership plans API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error.",
      },
      {
        status: 500,
      }
    );
  }
}