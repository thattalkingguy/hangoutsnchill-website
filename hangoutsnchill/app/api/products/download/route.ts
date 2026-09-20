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

export async function GET(request: Request) {
  try {
    /*
     * Authenticate the customer.
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
      return NextResponse.json(
        {
          error:
            "Your login session is invalid or has expired.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Get product ID from the URL.
     *
     * Example:
     * /api/products/download?productId=123
     */
    const { searchParams } = new URL(request.url);

    const productIdValue =
      searchParams.get("productId");

    const productId = Number(productIdValue);

    if (
      !productIdValue ||
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          error: "A valid product ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Confirm that this customer has actually paid
     * for this product.
     */
    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select(
        `
          id,
          buyer_id,
          product_id,
          payment_status,
          order_status
        `
      )
      .eq("buyer_id", user.id)
      .eq("product_id", productId)
      .eq("payment_status", "paid")
      .limit(1)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Download authorization error:",
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify your purchase.",
        },
        {
          status: 500,
        }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error:
            "You do not have access to this product.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * Retrieve the product's private storage path.
     */
    const {
      data: product,
      error: productError,
    } = await supabaseAdmin
      .from("products")
      .select(
        `
          id,
          title,
          product_type,
          delivery_type,
          download_path
        `
      )
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      console.error(
        "Product lookup error:",
        productError
      );

      return NextResponse.json(
        {
          error:
            "Unable to retrieve the product.",
        },
        {
          status: 500,
        }
      );
    }

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Make sure this is actually a downloadable
     * digital product.
     */
    if (
      product.product_type !== "digital" ||
      product.delivery_type !== "download"
    ) {
      return NextResponse.json(
        {
          error:
            "This product is not available as a digital download.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Make sure the product has a file attached.
     */
    if (!product.download_path) {
      return NextResponse.json(
        {
          error:
            "The digital file has not been attached to this product yet.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Generate a temporary signed URL.
     *
     * The file remains private in Supabase Storage.
     * The customer receives temporary access only.
     */
    const {
      data: signedUrlData,
      error: signedUrlError,
    } = await supabaseAdmin.storage
      .from("digital-products")
      .createSignedUrl(
        product.download_path,
        60 * 10
      );

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error(
        "Signed download URL error:",
        signedUrlError
      );

      return NextResponse.json(
        {
          error:
            "Unable to generate the download link.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      productId: product.id,
      title: product.title,
      downloadUrl: signedUrlData.signedUrl,
      expiresIn: 600,
    });
  } catch (error) {
    console.error(
      "Digital product download error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process the download request.",
      },
      {
        status: 500,
      }
    );
  }
}