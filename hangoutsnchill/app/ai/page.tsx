"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickActions = [
  { label: "🛍️ Marketplace", message: "Tell me about the HnC Marketplace." },
  { label: "🎓 Academy", message: "What can I learn through HnC Academy?" },
  { label: "🤝 Community", message: "Tell me about the HnC Community." },
  { label: "💰 Earn", message: "How can I earn through HnC?" },
  { label: "📈 Invest", message: "Tell me about HnC Invest." },
  {
    label: "📄 E-Affidavit",
    message: "How does the HnC E-Affidavit service work?",
  },
];

export default function AIPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm Ayo, your HnC Client Assistant. 😊 Ayo means Joy. How can I help you explore HnC today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(customMessage?: string) {
    const text = (customMessage ?? message).trim();

    if (!text || loading) {
      return;
    }

    setMessage("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/ai/ayo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Ayo is temporarily unavailable."
        );
      }

      if (data?.success && typeof data?.result === "string") {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.result,
          },
        ]);

        return;
      }

      throw new Error(
        data?.message || "Ayo is temporarily unavailable."
      );
    } catch (error) {
      console.error("Ayo chat error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
              HnC AI
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              Meet Ayo.
            </h1>

            <p className="mt-3 text-lg text-slate-600">
              Your HnC Client Assistant.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            ← Back to HnC
          </Link>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-900 px-6 py-5 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl">
                  😊
                </div>

                <div>
                  <h2 className="font-bold">Ayo</h2>
                  <p className="text-sm text-slate-300">
                    HnC Client Assistant • Ayo means Joy
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-[500px] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.map((item, index) => (
                  <div
                    key={`${item.role}-${index}`}
                    className={`flex ${
                      item.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${
                        item.role === "user"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {item.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                      Ayo is thinking... 😊
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t border-slate-200 p-4"
              >
                <div className="flex gap-3">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Ask Ayo anything about HnC..."
                    disabled={loading}
                    className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                  />

                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
                Quick Actions
              </p>

              <h2 className="mt-2 text-xl font-bold">
                What would you like to explore?
              </h2>

              <div className="mt-5 space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => void sendMessage(action.message)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                HnC Academy
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Learn Free. Grow Free.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ask Ayo about AI, digital skills, digital marketing, and other
                learning opportunities available through HnC Academy.
              </p>

              <Link
                href="/academy"
                className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Visit Academy →
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}