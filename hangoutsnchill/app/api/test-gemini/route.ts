import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasKey: !!process.env.GEMINI_API_KEY,
    firstFive: process.env.GEMINI_API_KEY?.slice(0, 5),
  });
}