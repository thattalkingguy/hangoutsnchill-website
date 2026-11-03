
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

export async function GET(req: Request) {
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

    const sellerId = data.user.id;

    const { data: orders, error: ordersError } = await admin
      .from("orders")
      .select(
        "id,buyer_id,amount,currency,payment_status,order_status,created_at,delivered_at,buyer_confirmed_at"
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Seller orders query failed:", ordersError);

      return NextResponse.json(
        { success: false, message: "Unable to load seller orders." },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const orderIds = orders.map((order) => order.id);

    const { data: funds, error: fundsError } = await admin
      .from("marketplace_seller_funds")
      .select("order_id,status")
      .eq("seller_id", sellerId)
      .in("order_id", orderIds);

    if (fundsError) {
      console.error("Seller funds query failed:", fundsError);

      return NextResponse.json(
        { success: false, message: "Unable to verify seller order funds." },
        { status: 500 }
      );
    }

    const fundsByOrder = new Map(
      (funds ?? []).map((fund) => [fund.order_id, fund.status])
    );

    const eligibleOrders = orders
      .filter((order) => fundsByOrder.has(order.id))
      .map((order) => ({
        ...order,
        funds_status: fundsByOrder.get(order.id),
      }));

    return NextResponse.json({
      success: true,
      orders: eligibleOrders,
    });
  } catch (error) {
    console.error("Seller orders API error:", error);

    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
