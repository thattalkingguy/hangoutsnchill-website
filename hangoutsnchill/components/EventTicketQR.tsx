"use client";

import { useEffect, useState } from "react";

type EventTicketQRProps = {
  ticketCode: string;
  size?: number;
};

export default function EventTicketQR({
  ticketCode,
  size = 220,
}: EventTicketQRProps) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (!ticketCode) return;

    const verificationUrl =
      `${window.location.origin}/events/ticket/verify?code=` +
      encodeURIComponent(ticketCode);

    setQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
        verificationUrl
      )}`
    );
  }, [ticketCode, size]);

  if (!qrUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-white"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-black/50">Generating QR…</span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center">
      <div className="rounded-2xl bg-white p-3 shadow-xl">
        <img
          src={qrUrl}
          alt={`Ticket QR code for ${ticketCode}`}
          width={size}
          height={size}
          className="block"
        />
      </div>

      <p className="mt-3 text-center text-xs font-semibold tracking-widest text-white/60">
        SCAN TO VERIFY TICKET
      </p>

      <p className="mt-1 text-center text-xs font-mono text-white/40">
        {ticketCode}
      </p>
    </div>
  );
}