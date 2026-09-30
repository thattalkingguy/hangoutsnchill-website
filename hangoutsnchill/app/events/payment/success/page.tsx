"use client";

import EventTicketQR from "@/components/EventTicketQR";
import { useEffect, useState } from "react";
import Link from "next/link";

type TicketResult = {
  success: boolean;
  message?: string;
  ticket?: {
    ticket_code: string;
    buyer_name: string;
    buyer_email: string;
    buyer_phone: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    currency: string;
    event: {
      id: string;
      slug: string;
      title: string;
      event_date: string;
      venue_name: string | null;
      venue_address: string | null;
    };
    ticket: {
      id: string;
      name: string;
    };
  };
};

export default function EventPaymentSuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const [result, setResult] = useState<TicketResult | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const reference =
          params.get("reference") || params.get("trxref") || "";

        if (!reference) {
          setStatus("error");
          setResult({
            success: false,
            message:
              "No Paystack payment reference was found. Please contact HnC support if payment was completed.",
          });
          return;
        }

        const response = await fetch("/api/events/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setStatus("error");
          setResult({
            success: false,
            message:
              data.message ||
              "We could not verify this payment. Please contact HnC support if money was deducted.",
          });
          return;
        }

        setResult(data);
        setStatus("success");
      } catch (error) {
        console.error("Payment verification error:", error);

        setStatus("error");
        setResult({
          success: false,
          message:
            "Something went wrong while confirming your payment. Please contact HnC support if money was deducted.",
        });
      }
    };

    verifyPayment();
  }, []);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />

            <h1 className="text-2xl font-bold">
              Confirming your payment...
            </h1>

            <p className="mt-3 text-sm text-white/60">
              Please wait while HnC confirms your Paystack payment and
              generates your ticket.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "error" || !result?.ticket) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-400/20 bg-red-400/[0.05] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl">
              !
            </div>

            <h1 className="text-2xl font-bold">
              Payment confirmation needs attention
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/65">
              {result?.message ||
                "We could not confirm this payment automatically."}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/events"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Back to HnC Events
              </Link>

              <Link
                href="/"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Go to HnC
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const ticket = result.ticket;

  const eventDate = new Date(ticket.event.event_date);

  const formattedDate = eventDate.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = eventDate.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: ticket.currency || "NGN",
    maximumFractionDigits: 0,
  }).format(ticket.total_amount);

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-4xl">
            ✓
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Payment Successful
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Your HnC ticket is ready.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60">
            Your payment has been confirmed and your ticket has been issued.
            Keep your ticket code and QR code safe.
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
          <div className="border-b border-white/10 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Event
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {ticket.event.title}
            </h2>

            <div className="mt-5 space-y-2 text-sm text-white/65">
              <p>
                <span className="font-semibold text-white">Date:</span>{" "}
                {formattedDate}
              </p>

              <p>
                <span className="font-semibold text-white">Time:</span>{" "}
                {formattedTime}
              </p>

              {ticket.event.venue_name && (
                <p>
                  <span className="font-semibold text-white">Venue:</span>{" "}
                  {ticket.event.venue_name}
                </p>
              )}

              {ticket.event.venue_address && (
                <p>
                  <span className="font-semibold text-white">Location:</span>{" "}
                  {ticket.event.venue_address}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                Ticket
              </p>

              <p className="mt-2 text-lg font-bold">{ticket.ticket.name}</p>

              <p className="mt-1 text-sm text-white/55">
                Quantity: {ticket.quantity}
              </p>

              <p className="mt-1 text-sm text-white/55">
                Total paid: {formattedAmount}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                Attendee
              </p>

              <p className="mt-2 text-lg font-bold">{ticket.buyer_name}</p>

              <p className="mt-1 break-all text-sm text-white/55">
                {ticket.buyer_email}
              </p>

              <p className="mt-1 text-sm text-white/55">
                {ticket.buyer_phone}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              Your Ticket QR
            </p>

            <div className="mt-6 flex justify-center">
              <EventTicketQR ticketCode={ticket.ticket_code} />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              Ticket Code
            </p>

            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-6">
              <p className="break-all text-2xl font-black tracking-[0.12em] text-emerald-300 sm:text-3xl">
                {ticket.ticket_code}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-white/45">
              Present the QR code or ticket code when requested at the event.
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/events/${ticket.event.slug}`}
            className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-white/90"
          >
            View Event
          </Link>

          <Link
            href="/events/pitch"
            className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Pitch Your Vibe
          </Link>

          <Link
            href="/events"
            className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/5"
          >
            More HnC Events
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-white/30">
          HangoutsNChill • Events • Tickets • Community
        </p>
      </div>
    </main>
  );
}