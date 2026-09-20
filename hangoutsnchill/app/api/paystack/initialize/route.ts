import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY environment variable.");
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase server environment variables."
  );
}

/*
 * Server-side Supabase client.
 *
 * IMPORTANT:
 * The service role key must NEVER be exposed to the browser.
 */
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

type CheckoutItem = {
  productId: number;
  quantity: number;
};

type InitializeRequestBody = {
  email: string;
  items: CheckoutItem[];
  reference?: string;
};

type ProductRow = {
  id: number;
  title: string;
  price: number;
  seller_id: string;
  currency: string;
  product_type: "digital" | "physical";
  delivery_type: "download" | "shipping";
  status: "draft" | "published" | "archived";
  stock: number;
};

export async function POST(request: Request) {
  try {
    /*
     * Authenticate the buyer using the Supabase access token.
     *
     * We do NOT trust a userId supplied by the browser.
     */
    const authorizationHeader =
      request.headers.get("authorization");

    if (!authorizationHeader) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const token = authorizationHeader.replace(
      /^Bearer\s+/i,
      ""
    );

    if (!token) {
      return NextResponse.json(
        {
          error: "Invalid authentication token.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error(
        "Supabase authentication failed:",
        userError
      );

      return NextResponse.json(
        {
          error: "Your session is invalid or has expired.",
        },
        {
          status: 401,
        }
      );
    }

    const verifiedUserId = user.id;

    /*
     * Read checkout request.
     */
    const body: InitializeRequestBody = await request.json();

    const {
      email,
      items,
      reference,
    } = body;

    /*
     * Use the authenticated user's email when available.
     * The submitted email is only used as a fallback.
     */
    const buyerEmail =
      user.email || email;

    if (
      !buyerEmail ||
      !Array.isArray(items) ||
      items.length === 0
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
     * Validate product IDs and quantities.
     */
    for (const item of items) {
      if (
        !Number.isInteger(Number(item.productId)) ||
        Number(item.productId) <= 0 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return NextResponse.json(
          {
            error: "One or more checkout items are invalid.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * Prevent duplicate product IDs.
     */
    const productIds = items.map(
      (item) => Number(item.productId)
    );

    if (
      new Set(productIds).size !== productIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "Duplicate products were found in the checkout cart.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Fetch the authoritative product information
     * directly from Supabase.
     */
    const {
      data: products,
      error: productsError,
    } = await supabaseAdmin
      .from("products")
      .select(
        `
          id,
          title,
          price,
          seller_id,
          currency,
          product_type,
          delivery_type,
          status,
          stock
        `
      )
      .in("id", productIds);

    if (productsError) {
      console.error(
        "Unable to load checkout products:",
        productsError
      );

      return NextResponse.json(
        {
          error:
            "Unable to validate checkout products.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !products ||
      products.length !== productIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "One or more products in your cart are no longer available.",
        },
        {
          status: 400,
        }
      );
    }

    const productMap = new Map<number, ProductRow>();

    for (const product of products as ProductRow[]) {
      productMap.set(product.id, product);
    }

    /*
     * Build the trusted cart from database values.
     */
    const cartItems: Array<{
      product_id: number;
      seller_id: string;
      quantity: number;
      unit_price: number;
      title: string;
    }> = [];

    let amountInNaira = 0;
    let checkoutCurrency = "NGN";

    for (const item of items) {
      const product = productMap.get(
        Number(item.productId)
      );

      if (!product) {
        return NextResponse.json(
          {
            error:
              "A product in your cart could not be found.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Only published products can be purchased.
       */
      if (product.status !== "published") {
        return NextResponse.json(
          {
            error:
              `"${product.title}" is not currently available for purchase.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * HnC currently processes NGN checkout.
       */
      const productCurrency = (
        product.currency || "NGN"
      ).toUpperCase();

      if (productCurrency !== "NGN") {
        return NextResponse.json(
          {
            error:
              "Only NGN checkout is currently supported.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Make sure the database contains a valid price.
       */
      if (
        !Number.isFinite(Number(product.price)) ||
        Number(product.price) <= 0
      ) {
        return NextResponse.json(
          {
            error:
              `Product "${product.title}" has an invalid price.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Physical products must have enough stock.
       * Digital products do not require stock checking.
       */
      if (
        product.product_type === "physical" &&
        Number(product.stock) < Number(item.quantity)
      ) {
        return NextResponse.json(
          {
            error:
              `"${product.title}" does not have enough stock.`,
          },
          {
            status: 400,
          }
        );
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(product.price);

      amountInNaira +=
        unitPrice * quantity;

      cartItems.push({
        product_id: product.id,
        seller_id: product.seller_id,
        quantity,
        unit_price: unitPrice,
        title: product.title,
      });

      checkoutCurrency = productCurrency;
    }

    /*
     * Convert Naira to Kobo.
     */
    const amountInKobo = Math.round(
      amountInNaira * 100
    );

    if (amountInKobo <= 0) {
      return NextResponse.json(
        {
          error: "Invalid checkout amount.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Initialize Paystack.
     *
     * IMPORTANT:
     * user_id, product prices, sellers and titles
     * all come from trusted server-side sources.
     */
    const payload = {
      email: buyerEmail,
      amount: amountInKobo,
      currency: checkoutCurrency,

      metadata: {
        user_id: verifiedUserId,
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
      console.error(
        "Paystack initialization failed:",
        data
      );

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
    console.error(
      "Paystack initialization error:",
      error
    );

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