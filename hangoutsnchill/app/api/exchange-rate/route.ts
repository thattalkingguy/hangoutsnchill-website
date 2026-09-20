import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.frankfurter.dev/v2/rate/USD/NGN?providers=CBN",
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Exchange-rate API returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      base: data.base,
      quote: data.quote,
      rate: data.rate,
      date: data.date,
      source: "CBN",
    });
  } catch (error) {
    console.error("Exchange rate error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve exchange rate.",
      },
      { status: 500 }
    );
  }
}