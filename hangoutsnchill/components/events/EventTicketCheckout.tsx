"use client";

import { useState } from "react";

type TicketCheckoutProps = {
  eventId: string;
  ticketId: string;
  ticketName: string;
  unitPrice: number;
  currency: string;
  disabled?: boolean;
};

function formatMoney(
  amount: number,
  currency: string
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function EventTicketCheckout({
  eventId,
  ticketId,
  ticketName,
  unitPrice,
  currency,
  disabled = false,
}: TicketCheckoutProps) {
  const [open, setOpen] =
    useState(false);

  const [quantity, setQuantity] =
    useState(1);

  const [buyerName, setBuyerName] =
    useState("");

  const [buyerEmail, setBuyerEmail] =
    useState("");

  const [buyerPhone, setBuyerPhone] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const total =
    unitPrice * quantity;

  async function startPayment() {
    setError("");

    if (!buyerName.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (
      !buyerEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        buyerEmail.trim()
      )
    ) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!buyerPhone.trim()) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/events/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            event_id: eventId,
            ticket_id: ticketId,
            quantity,
            buyer_name:
              buyerName.trim(),
            buyer_email:
              buyerEmail.trim(),
            buyer_phone:
              buyerPhone.trim(),
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to start payment."
        );
      }

      if (
        !result.authorization_url
      ) {
        throw new Error(
          "Paystack authorization link was not returned."
        );
      }

      /*
       * Paystack handles the actual payment.
       * We send the buyer to Paystack's
       * secure hosted checkout.
       */
      window.location.href =
        result.authorization_url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment."
      );

      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 w-full rounded-full bg-white px-5 py-3.5 text-sm font-bold text-black opacity-30"
      >
        Unavailable
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setSuccess(false);
          setOpen(true);
        }}
        className="mt-6 w-full rounded-full bg-white px-5 py-3.5 text-sm font-bold text-black transition hover:bg-white/85"
      >
        Buy Ticket
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm md:items-center md:p-6">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#101010] p-6 text-white shadow-2xl md:max-w-lg md:rounded-3xl md:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">
                  HnC Events
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Get your ticket
                </h3>

                <p className="mt-2 text-sm text-white/45">
                  {ticketName}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                    Price
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {formatMoney(
                      unitPrice,
                      currency
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-right text-xs uppercase tracking-[0.2em] text-white/30">
                    Quantity
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.max(
                            1,
                            quantity - 1
                          )
                        )
                      }
                      disabled={
                        quantity <= 1
                      }
                      className="h-9 w-9 rounded-full border border-white/10 text-lg disabled:opacity-30"
                    >
                      −
                    </button>

                    <span className="w-8 text-center font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            20,
                            quantity + 1
                          )
                        )
                      }
                      disabled={
                        quantity >= 20
                      }
                      className="h-9 w-9 rounded-full border border-white/10 text-lg disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-sm text-white/40">
                  Total
                </span>

                <span className="text-2xl font-black">
                  {formatMoney(
                    total,
                    currency
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                  Full name
                </label>

                <input
                  type="text"
                  value={buyerName}
                  onChange={(event) =>
                    setBuyerName(
                      event.target.value
                    )
                  }
                  placeholder="Your full name"
                  autoComplete="name"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                  Email
                </label>

                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(event) =>
                    setBuyerEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                  Phone / WhatsApp
                </label>

                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(event) =>
                    setBuyerPhone(
                      event.target.value
                    )
                  }
                  placeholder="080..."
                  autoComplete="tel"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-200">
                Payment started successfully.
              </div>
            )}

            <button
              type="button"
              onClick={startPayment}
              disabled={loading}
              className="mt-6 w-full rounded-full bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Connecting to Paystack..."
                : `Pay ${formatMoney(
                    total,
                    currency
                  )} →`}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-white/30">
              You will be redirected to
              Paystack's secure payment
              page to complete your purchase.
            </p>
          </div>
        </div>
      )}
    </>
  );
}