
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing server environment variables.");
}

const admin = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);
    const { data, error: authError } = await admin.auth.getUser(token);

    if (authError || !data.user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const action = body?.action;

    let rpcName: string;
    let rpcArgs: Record<string, string>;

    if (action === "mark_delivered") {
      rpcName = "mark_marketplace_order_delivered";
      rpcArgs = {
        p_order_id: id,
        p_seller_id: data.user.id,
      };
    } else if (action === "confirm_receipt") {
      rpcName = "confirm_marketplace_order_delivery";
      rpcArgs = {
        p_order_id: id,
        p_buyer_id: data.user.id,
      };
    } else {
      return NextResponse.json(
        { success: false, message: "Unsupported order action." },
        { status: 400 }
      );
    }

    const { data: result, error } = await admin.rpc(
      rpcName,
      rpcArgs
    );

    if (error) {
      console.error("Marketplace order action failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unable to process this order.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
      message:
        result?.message ?? "Order action completed successfully.",
    });
  } catch (error) {
    console.error("Marketplace order action API error:", error);

    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
