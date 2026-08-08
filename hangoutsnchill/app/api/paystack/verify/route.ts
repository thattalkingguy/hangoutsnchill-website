import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing reference.",
        },
        {
          status: 400,
        }
      );
    }

    const verify = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await verify.json();

    if (
      !result.status ||
      !result.data ||
      result.data.status !== "success"
    ) {
      return NextResponse.json({
        success: false,
        message: "Payment not verified.",
      });
    }

    // Prevent duplicate processing
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("paystack_reference", reference)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        message: "Order already processed.",
      });
    }

    const metadata = result.data.metadata ?? {};

    const buyerId = metadata.user_id ?? null;
    const sellerId = metadata.seller_id ?? null;
    const productId = metadata.product_id ?? null;
    const quantity = Number(metadata.quantity ?? 1);
    const unitPrice = Number(metadata.unit_price ?? result.data.amount / 100);

    const amount = Number(result.data.amount) / 100;

    if (!buyerId || !sellerId || !productId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment metadata is incomplete. Missing buyer, seller or product.",
        },
        {
          status: 400,
        }
      );
    }

    // Create order
    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: buyerId,
        seller_id: sellerId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        paystack_reference: reference,
        amount,
        currency: result.data.currency,
        payment_status: "paid",
        order_status: "processing",
      });

    if (orderError) {
      console.error(orderError);

      return NextResponse.json(
        {
          success: false,
          message: orderError.message,
        },
        {
          status: 500,
        }
      );
    }

    // Credit seller wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", sellerId)
      .maybeSingle();

    if (wallet) {
      await supabase
        .from("wallets")
        .update({
          balance: Number(wallet.balance) + amount,
          pending: Number(wallet.pending) + amount,
          total_sales: Number(wallet.total_sales) + amount,
          withdrawable: Number(wallet.withdrawable) + amount,
        })
        .eq("user_id", sellerId);
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}