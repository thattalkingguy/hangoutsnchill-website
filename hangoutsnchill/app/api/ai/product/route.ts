import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json(
        { success: false, message: "Missing product idea." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Create a professional marketplace listing for this product:

${idea}

Include:
- Product title
- Description
- Features
- Benefits
- Suggested price
- SEO keywords`,
    });

    console.log(response);

    return NextResponse.json({
      success: true,
      result: response.text ?? "",
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}