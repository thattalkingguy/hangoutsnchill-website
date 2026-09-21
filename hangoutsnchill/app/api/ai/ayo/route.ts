import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const HNC_CONTEXT = `
You are Ayo, the HnC Client Assistant.

Ayo means "Joy."

You are the friendly digital assistant for HangoutsNChill (HnC), a Nigerian-built
digital ecosystem designed to help people connect, discover, learn, create,
shop, earn, invest, and find opportunities.

HnC includes:
- Marketplace
- Academy
- Community
- Creators
- Earn
- Invest
- E-Affidavit public-service access
- Other digital services and opportunities

HnC ACADEMY:

Current learning partners:

- Alison — Business & Digital Skills
  Learning: FREE TO STUDY
  Certificate: Check individual course
  Website: https://alison.com/

- Coursera — Technology & Career
  Learning: FREE OPTIONS
  Certificate: Course dependent
  Website: https://www.coursera.org/

- edX — Education & Professional Skills
  Learning: FREE OPTIONS
  Certificate: Course dependent
  Website: https://www.edx.org/

Current HnC course catalogue:

- AI Foundations — Alison
- AI & Machine Learning Courses — Coursera
- Artificial Intelligence Courses — edX
- Digital Marketing Courses — Alison
- Digital Skills Courses — Coursera
- Technology Courses — edX

Important:
- Free to study does not automatically mean free certificate.
- Certificate availability and pricing can vary.
- Never invent courses, prices, certificates, partnerships, or guarantees.
- Direct users to the provider's official website for current terms.

PERSONALITY:
- Warm
- Friendly
- Helpful
- Clear
- Practical
- Respectful
- Concise
- Encouraging without unrealistic promises

IMPORTANT RULES:
- Never invent HnC services, prices, partnerships, policies, links, or guarantees.
- If you do not know something, say so clearly.
- Do not claim HnC is a government agency.
- For E-Affidavit, explain that HnC currently provides information and access
  to the official Federal High Court e-Affidavit service.
- Do not request sensitive identity documents through chat.
- Do not provide personalized financial, investment, legal, or medical advice.
`;

function getLocalHncAnswer(message: string): string | null {
  const text = message.toLowerCase().trim();

  const asksAboutAiCourses =
    (text.includes("ai") ||
      text.includes("artificial intelligence") ||
      text.includes("machine learning")) &&
    (text.includes("course") ||
      text.includes("learn") ||
      text.includes("academy") ||
      text.includes("study"));

  const asksAboutDigitalMarketing =
    text.includes("digital marketing") &&
    (text.includes("course") ||
      text.includes("learn") ||
      text.includes("academy") ||
      text.includes("study"));

  const asksAboutDigitalSkills =
    (text.includes("digital skills") || text.includes("technology courses")) &&
    (text.includes("course") ||
      text.includes("learn") ||
      text.includes("academy") ||
      text.includes("study"));

  const asksAboutAcademy =
    text.includes("hnc academy") &&
    (text.includes("course") ||
      text.includes("learn") ||
      text.includes("available") ||
      text.includes("offer"));

  if (asksAboutAiCourses || asksAboutAcademy) {
    return `Absolutely. HnC Academy currently has these AI & Technology learning options:

1. AI Foundations — Alison
   Free-to-study options are available.
   Certificate terms depend on the specific course.
   Official website: https://alison.com/

2. AI & Machine Learning Courses — Coursera
   Free learning options may be available.
   Certificate availability and pricing are course-dependent.
   Official website: https://www.coursera.org/

3. Artificial Intelligence Courses — edX
   Free learning options may be available.
   Verified certificate terms and pricing are course-dependent.
   Official website: https://www.edx.org/

If you're new to AI, I can also help you choose between beginner AI, machine learning, generative AI, and AI for business.

Remember: free learning does not automatically mean a free certificate. Check the provider's official website for current course and certificate terms.`;
  }

  if (asksAboutDigitalMarketing) {
    return `HnC Academy currently has a Digital Marketing learning option:

📣 Digital Marketing Courses — Alison

Learning status:
FREE TO STUDY options

Certificate:
Certificate terms depend on the specific course.

Official website:
https://alison.com/

If you tell me whether you're interested in social media marketing, content marketing, advertising, or general digital marketing, I can help you narrow down what to explore.`;
  }

  if (asksAboutDigitalSkills) {
    return `HnC Academy currently has these Digital Skills and Technology learning options:

1. Digital Skills Courses — Coursera
   Free options may be available.
   Certificate availability and pricing are course-dependent.
   https://www.coursera.org/

2. Technology Courses — edX
   Free options may be available.
   Certificate terms depend on the specific course.
   https://www.edx.org/

Tell me which area interests you — technology, data, AI, business tools, or another digital skill — and I can help you narrow it down.`;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a message.",
        },
        { status: 400 }
      );
    }

    const cleanMessage = message.trim();

    // HnC-owned knowledge is handled locally first.
    // This keeps core HnC information available even when Gemini is busy.
    const localAnswer = getLocalHncAnswer(cleanMessage);

    if (localAnswer) {
      return NextResponse.json({
        success: true,
        result: localAnswer,
        source: "hnc-local",
      });
    }

    // Everything else can use Gemini.
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${HNC_CONTEXT}

USER MESSAGE:
${cleanMessage}

Respond as Ayo, the HnC Client Assistant.
`,
      });

      return NextResponse.json({
        success: true,
        result:
          response.text ||
          "I'm Ayo, your HnC Client Assistant. How can I help you today?",
        source: "gemini",
      });
    } catch (error: any) {
      console.error("Ayo Gemini error:", error);

      return NextResponse.json(
        {
          success: false,
          message:
            "Ayo is temporarily unavailable for that question. Please try again shortly.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Ayo request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Ayo is temporarily unavailable. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}