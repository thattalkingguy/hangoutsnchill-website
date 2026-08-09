import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY environment variable.");
}

type CartItem = {
  productId: number;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  title: string;
};

type InitializeRequestBody = {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  userId: string;
  items: CartItem[];
};

export async function POST(request: Request) {
  try {
    const body: InitializeRequestBody = await request.json();

    const {
      email,
      amount,
      currency = "NGN",
      reference,
      userId,
      items,
    } = body;

    if (
      !email ||
      !userId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid payment details.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate every cart item before sending
     * anything to Paystack.
     */
    for (const item of items) {
      if (
        !item.productId ||
        !item.sellerId ||
        !item.quantity ||
        Number(item.quantity) <= 0 ||
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) <= 0 ||
        !item.title
      ) {
        return NextResponse.json(
          {
            error: "One or more cart items are invalid.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Convert the cart into the exact metadata format
     * expected by the verification endpoint.
     */
    const cartItems = items.map((item) => ({
      product_id: item.productId,
      seller_id: item.sellerId,
      quantity: Number(item.quantity),
      unit_price: Number(item.unitPrice),
      title: item.title,
    }));

    const payload = {
      email,
      amount: Math.round(Number(amount)),
      currency,

      metadata: {
        user_id: userId,
        cart_items: cartItems,
        platform: "HangoutsNChill",
      },

      callback_url:
        "https://hangouts-n-chill.vercel.app/payment/success",

      ...(reference ? { reference } : {}),
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Paystack initialization failed:", data);

      return NextResponse.json(
        {
          error:
            data.message ??
            "Unable to initialize Paystack transaction.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Paystack initialization error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}