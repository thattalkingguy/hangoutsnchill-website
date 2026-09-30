"use client";

import { useEffect, useState } from "react";

type EventEventQRProps = {
  slug: string;
  size?: number;
};

export default function EventEventQR({
  slug,
  size = 260,
}: EventEventQRProps) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (!slug) return;

    // Always use the public HnC website for promotional Event QR codes.
    // This prevents localhost URLs from being encoded when testing on a phone.
    const eventUrl = `https://hangoutsnchill.com/events/${slug}`;

    setQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
        eventUrl
      )}`
    );
  }, [slug, size]);

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
          alt="Scan to view this HnC event"
          width={size}
          height={size}
          className="block"
        />
      </div>

      <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white/60">
        Scan for Tickets
      </p>

      <p className="mt-1 max-w-[260px] break-all text-center text-xs text-white/35">
        hangoutsnchill.com/events/{slug}
      </p>
    </div>
  );
}