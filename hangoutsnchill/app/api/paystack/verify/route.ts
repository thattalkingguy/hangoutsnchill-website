import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type CartItemMetadata = {
  product_id: number;
  seller_id: string;
  quantity: number;
  unit_price: number;
  title: string;
};

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

    /*
     * Verify the transaction directly with Paystack.
     */
    const verify = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          Accept: "application/json",
        },
      }
    );

    const result = await verify.json();

    if (
      !verify.ok ||
      !result.status ||
      !result.data ||
      result.data.status !== "success"
    ) {
      return NextResponse.json({
        success: false,
        message: "Payment not verified.",
      });
    }

    const transaction = result.data;

    /*
     * Prevent duplicate fulfillment.
     *
     * One Paystack reference can produce multiple marketplace
     * orders, so we check the reference across the orders table.
     */
    const {
      data: existingOrders,
      error: existingOrdersError,
    } = await supabase
      .from("orders")
      .select("id")
      .eq("paystack_reference", reference)
      .limit(1);

    if (existingOrdersError) {
      console.error(existingOrdersError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to check existing orders.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingOrders && existingOrders.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Order already processed.",
      });
    }

    /*
     * Read the cart metadata created by the initialize endpoint.
     */
    const metadata = transaction.metadata ?? {};

    const buyerId = metadata.user_id ?? null;

    let cartItems: CartItemMetadata[] = [];

    if (Array.isArray(metadata.cart_items)) {
      cartItems = metadata.cart_items;
    } else if (typeof metadata.cart_items === "string") {
      try {
        const parsed = JSON.parse(metadata.cart_items);

        if (Array.isArray(parsed)) {
          cartItems = parsed;
        }
      } catch (error) {
        console.error(
          "Unable to parse cart_items metadata:",
          error
        );
      }
    }

    if (!buyerId || cartItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment metadata is incomplete. Missing buyer or cart items.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Recalculate the expected cart amount from the metadata.
     */
    const calculatedAmount = cartItems.reduce(
      (sum, item) =>
        sum +
        Number(item.unit_price) *
          Number(item.quantity),
      0
    );

    const paidAmount = Number(transaction.amount) / 100;

    if (
      !Number.isFinite(calculatedAmount) ||
      !Number.isFinite(paidAmount) ||
      Math.round(calculatedAmount * 100) !==
        Math.round(paidAmount * 100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount does not match the cart total.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate every cart item before creating any order.
     */
    for (const item of cartItems) {
      if (
        !item.product_id ||
        !item.seller_id ||
        !item.quantity ||
        Number(item.quantity) <= 0 ||
        !Number.isFinite(Number(item.unit_price)) ||
        Number(item.unit_price) <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "One or more cart items contain invalid payment metadata.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Create one marketplace order for every product.
     */
    const orders = cartItems.map((item) => ({
      buyer_id: buyerId,
      seller_id: item.seller_id,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      paystack_reference: reference,
      amount:
        Number(item.unit_price) *
        Number(item.quantity),
      currency: transaction.currency,
      payment_status: "paid",
      order_status: "processing",
    }));

    const { error: orderError } = await supabase
      .from("orders")
      .insert(orders);

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

    /*
     * Group purchased amounts by seller.
     */
    const sellerTotals = new Map<string, number>();

    for (const item of cartItems) {
      const sellerId = item.seller_id;

      const itemAmount =
        Number(item.unit_price) *
        Number(item.quantity);

      const current =
        sellerTotals.get(sellerId) ?? 0;

      sellerTotals.set(
        sellerId,
        current + itemAmount
      );
    }

    /*
     * Credit each seller wallet once.
     */
    for (const [
      sellerId,
      sellerAmount,
    ] of sellerTotals.entries()) {
      const {
        data: wallet,
        error: walletError,
      } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", sellerId)
        .maybeSingle();

      if (walletError) {
        console.error(walletError);

        return NextResponse.json(
          {
            success: false,
            message:
              "Orders were created, but a seller wallet could not be read.",
          },
          {
            status: 500,
          }
        );
      }

      if (wallet) {
        const {
          error: walletUpdateError,
        } = await supabase
          .from("wallets")
          .update({
            balance:
              Number(wallet.balance) +
              sellerAmount,

            pending:
              Number(wallet.pending) +
              sellerAmount,

            total_sales:
              Number(wallet.total_sales) +
              sellerAmount,

            withdrawable:
              Number(wallet.withdrawable) +
              sellerAmount,
          })
          .eq("user_id", sellerId);

        if (walletUpdateError) {
          console.error(walletUpdateError);

          return NextResponse.json(
            {
              success: false,
              message:
                "Orders were created, but a seller wallet could not be updated.",
            },
            {
              status: 500,
            }
          );
        }
      }
    }

    /*
     * ============================================================
     * NOTIFICATIONS
     * ============================================================
     */

    /*
     * 1. Notify the buyer.
     */
    const buyerNotification = {
      user_id: buyerId,
      title: "Payment successful 🎉",
      message: `Your payment of ₦${paidAmount.toLocaleString(
        "en-NG"
      )} was successful. Your ${orders.length} ${
        orders.length === 1 ? "order has" : "orders have"
      } been created.`,
      is_read: false,
    };

    const {
      error: buyerNotificationError,
    } = await supabase
      .from("notifications")
      .insert(buyerNotification);

    if (buyerNotificationError) {
      console.error(
        "Buyer notification failed:",
        buyerNotificationError
      );
    }

    /*
     * 2. Notify each seller.
     *
     * Group the seller's products together so a seller
     * receives one notification instead of one notification
     * for every individual product.
     */
    for (const [
      sellerId,
      sellerAmount,
    ] of sellerTotals.entries()) {
      const sellerItems = cartItems.filter(
        (item) => item.seller_id === sellerId
      );

      const productNames = sellerItems
        .map((item) => item.title)
        .filter(Boolean);

      const productText =
        productNames.length === 1
          ? productNames[0]
          : `${productNames.length} products`;

      const sellerNotification = {
        user_id: sellerId,
        title: "New order received 🛒",
        message: `You received a new order for ${productText}. Sale amount: ₦${sellerAmount.toLocaleString(
          "en-NG"
        )}.`,
        is_read: false,
      };

      const {
        error: sellerNotificationError,
      } = await supabase
        .from("notifications")
        .insert(sellerNotification);

      if (sellerNotificationError) {
        console.error(
          `Seller notification failed for ${sellerId}:`,
          sellerNotificationError
        );
      }
    }

    /*
     * Payment, orders, wallets and notifications have
     * now been processed.
     */
    return NextResponse.json({
      success: true,
      message:
        "Payment verified, orders processed and notifications created.",
      orderCount: orders.length,
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