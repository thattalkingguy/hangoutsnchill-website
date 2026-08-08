import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY environment variable.");
}

type InitializeRequestBody = {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  userId: string;
  sellerId: string;
  productId: number;
  quantity?: number;
  unitPrice: number;
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
      sellerId,
      productId,
      quantity = 1,
      unitPrice,
    } = body;

    if (
      !email ||
      !userId ||
      !sellerId ||
      !productId ||
      !unitPrice ||
      !amount ||
      Number.isNaN(amount) ||
      amount <= 0
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

    const payload = {
      email,
      amount,
      currency,

      metadata: {
        user_id: userId,
        seller_id: sellerId,
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        platform: "HangoutsNChill",
      },

      callback_url: "http://localhost:3000/payment/success",

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
    console.error(error);

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