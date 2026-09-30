import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import EventTicketCheckout from "@/components/events/EventTicketCheckout";
import EventEventQR from "@/components/EventEventQR";

export const dynamic = "force-dynamic";

type Event = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  event_date: string;
  doors_open_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  organizer_name: string | null;
  organizer_phone: string | null;
  organizer_whatsapp: string | null;
  organizer_email: string | null;
  hero_image_url: string | null;
  status: string;
  featured: boolean;
  currency: string;
  before_video_url: string | null;
  before_youtube_url: string | null;
  after_video_url: string | null;
  after_youtube_url: string | null;
};

type Ticket = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  base_price: number;
  quantity_available: number | null;
  quantity_sold: number;
  discount_percent: number;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  is_active: boolean;
  sort_order: number;
};

type EventMedia = {
  id: string;
  event_id: string;
  media_type: "image" | "video" | "poster";
  media_url: string;
  title: string | null;
  caption: string | null;
  sort_order: number;
  is_featured: boolean;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCurrentPrice(ticket: Ticket) {
  const now = Date.now();

  const promoActive =
    ticket.discount_percent > 0 &&
    ticket.discount_starts_at &&
    ticket.discount_ends_at &&
    now >= new Date(ticket.discount_starts_at).getTime() &&
    now <= new Date(ticket.discount_ends_at).getTime();

  if (!promoActive) {
    return {
      price: Number(ticket.base_price),
      discounted: false,
    };
  }

  const discountedPrice =
    Number(ticket.base_price) *
    (1 - Number(ticket.discount_percent) / 100);

  return {
    price: Math.round(discountedPrice),
    discounted: true,
  };
}

function getRemainingTickets(ticket: Ticket) {
  if (ticket.quantity_available === null) {
    return null;
  }

  return Math.max(
    0,
    Number(ticket.quantity_available) - Number(ticket.quantity_sold)
  );
}

function EventMediaCard({
  media,
}: {
  media: EventMedia;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="relative aspect-[4/3] bg-black">
        {media.media_type === "video" ? (
          <video
            src={media.media_url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={media.media_url}
            alt={media.title || "Event community media"}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {(media.title || media.caption) && (
        <div className="p-5">
          {media.title && (
            <h3 className="text-sm font-bold text-white">
              {media.title}
            </h3>
          )}

          {media.caption && (
            <p className="mt-2 text-sm leading-6 text-white/50">
              {media.caption}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    notFound();
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
  );

  const { data: event } = await supabase
    .from("events")
    .select(`
      id,
      slug,
      title,
      short_description,
      description,
      event_date,
      doors_open_at,
      venue_name,
      venue_address,
      city,
      state,
      country,
      organizer_name,
      organizer_phone,
      organizer_whatsapp,
      organizer_email,
      hero_image_url,
      status,
      featured,
      currency,
      before_video_url,
      before_youtube_url,
      after_video_url,
      after_youtube_url
    `)
    .eq("slug", slug)
    .in("status", ["published", "sold_out"])
    .maybeSingle();

  if (!event) {
    notFound();
  }

  const { data: ticketData } = await supabase
    .from("event_tickets")
    .select(`
      id,
      event_id,
      name,
      description,
      base_price,
      quantity_available,
      quantity_sold,
      discount_percent,
      discount_starts_at,
      discount_ends_at,
      is_active,
      sort_order
    `)
    .eq("event_id", event.id)
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  const { data: mediaData } = await supabase
    .from("event_media")
    .select(`
      id,
      event_id,
      media_type,
      media_url,
      title,
      caption,
      sort_order,
      is_featured
    `)
    .eq("event_id", event.id)
    .order("is_featured", {
      ascending: false,
    })
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  const tickets = (ticketData ?? []) as Ticket[];
  const media = (mediaData ?? []) as EventMedia[];

  const promoTickets = tickets.filter(
    (ticket) => getCurrentPrice(ticket).discounted
  );

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-12">
          <Link
            href="/events"
            className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to HnC Events
          </Link>

          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <div className="grid lg:grid-cols-2">
              {/* POSTER */}
              <div className="flex min-h-[480px] items-center justify-center bg-black p-4 md:min-h-[680px] md:p-8">
                {event.hero_image_url ? (
                  <img
                    src={event.hero_image_url}
                    alt={event.title}
                    className="max-h-[650px] w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-white/30">
                    <div className="text-5xl">🎟️</div>

                    <p className="mt-4 uppercase tracking-[0.3em]">
                      HnC Events
                    </p>
                  </div>
                )}
              </div>

              {/* EVENT INFO */}
              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                  {event.status === "sold_out"
                    ? "Sold Out"
                    : "HnC Event"}
                </div>

                <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                  {event.title}
                </h1>

                <p className="mt-5 text-lg leading-8 text-white/60">
                  {event.short_description ||
                    event.description ||
                    "Experience this event with HnC."}
                </p>

                <div className="mt-8 space-y-4 text-sm text-white/75">
                  <div>
                    <span className="text-white/35">DATE</span>

                    <div className="mt-1 text-base font-semibold">
                      {formatDate(event.event_date)}
                    </div>
                  </div>

                  {event.venue_name && (
                    <div>
                      <span className="text-white/35">VENUE</span>

                      <div className="mt-1 text-base font-semibold">
                        {event.venue_name}
                      </div>

                      {event.venue_address && (
                        <div className="mt-1 text-white/45">
                          {event.venue_address}
                        </div>
                      )}
                    </div>
                  )}

                  {event.organizer_name && (
                    <div>
                      <span className="text-white/35">
                        ORGANIZER
                      </span>

                      <div className="mt-1 text-base font-semibold">
                        {event.organizer_name}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#tickets"
                    className="inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:bg-white/85"
                  >
                    Get Tickets →
                  </a>

                  <Link
                    href="/events/pitch"
                    className="inline-flex rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Pitch Your Vibe →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSAL EVENT QR */}
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
          <div className="grid items-center gap-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:grid-cols-[1fr_auto] md:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
                Share This Event
              </p>

              <h2 className="mt-3 text-2xl font-black md:text-4xl">
                Scan. View. Get Your Ticket.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">
                Scan this QR code from a poster, flyer or screen to open this
                event directly on HnC and purchase your ticket securely.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#tickets"
                  className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/85"
                >
                  Get Tickets →
                </a>

                <Link
                  href="/events"
                  className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  HnC Events
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <EventEventQR slug={event.slug} size={240} />
            </div>
          </div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
              The Experience Starts
            </p>

            <div className="mt-4 text-3xl font-black md:text-5xl">
              {formatDate(event.event_date)}
            </div>

            <p className="mt-3 text-sm text-white/40">
              Countdown timer coming next.
            </p>
          </div>
        </div>
      </section>

      {/* TICKETS */}
      <section id="tickets" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
              Tickets
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-5xl">
              Choose your experience.
            </h2>

            <p className="mt-4 max-w-2xl text-white/45">
              Select your ticket category and complete your secure Paystack
              checkout.
            </p>

            {promoTickets.length > 0 && (
              <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70">
                🔥 Limited-time HnC promo pricing is active
              </div>
            )}
          </div>

          {tickets.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => {
                const pricing = getCurrentPrice(ticket);

                const remaining = getRemainingTickets(ticket);

                const unavailable =
                  remaining !== null && remaining <= 0;

                return (
                  <article
                    key={ticket.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-black">
                        {ticket.name}
                      </h3>

                      {pricing.discounted && (
                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase text-black">
                          -{ticket.discount_percent}%
                        </span>
                      )}
                    </div>

                    {ticket.description && (
                      <p className="mt-3 text-sm leading-6 text-white/45">
                        {ticket.description}
                      </p>
                    )}

                    <div className="mt-6">
                      {pricing.discounted && (
                        <div className="text-sm text-white/30 line-through">
                          {formatMoney(
                            Number(ticket.base_price),
                            event.currency
                          )}
                        </div>
                      )}

                      <div className="text-3xl font-black">
                        {formatMoney(
                          pricing.price,
                          event.currency
                        )}
                      </div>
                    </div>

                    {remaining !== null && (
                      <p className="mt-3 text-xs text-white/35">
                        {remaining > 0
                          ? `${remaining} tickets remaining`
                          : "Sold out"}
                      </p>
                    )}

                    <EventTicketCheckout
                      eventId={event.id}
                      ticketId={ticket.id}
                      ticketName={ticket.name}
                      unitPrice={pricing.price}
                      currency={event.currency}
                      disabled={
                        unavailable ||
                        event.status === "sold_out"
                      }
                    />
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
              <div className="text-4xl">🎟️</div>

              <h3 className="mt-4 text-xl font-bold">
                Tickets are coming soon.
              </h3>

              <p className="mt-2 text-sm text-white/40">
                Ticket categories for this event have not been published yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
              HnC Event Media
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              Before & After
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {event.before_video_url ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <video
                  src={event.before_video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="aspect-video h-full w-full object-cover"
                />

                <div className="p-5">
                  <p className="text-sm font-bold">
                    5-Second Event Promo
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-center">
                <div>
                  <div className="text-3xl">🎬</div>

                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/30">
                    5-Second Event Promo
                  </p>

                  <p className="mt-2 text-xs text-white/20">
                    Coming soon
                  </p>
                </div>
              </div>
            )}

            {event.after_video_url ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                <video
                  src={event.after_video_url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video h-full w-full object-cover"
                />

                <div className="p-5">
                  <p className="text-sm font-bold">
                    5-Second Event Recap
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-center">
                <div>
                  <div className="text-3xl">🎥</div>

                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/30">
                    5-Second Event Recap
                  </p>

                  <p className="mt-2 text-xs text-white/20">
                    Available after the event
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COMMUNITY GALLERY */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
                Pitch Your Vibe
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Community Gallery
              </h2>

              <p className="mt-3 max-w-2xl text-white/45">
                Approved moments submitted by the people experiencing this
                event.
              </p>
            </div>

            <Link
              href="/events/pitch"
              className="inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/85"
            >
              Share Your Moment →
            </Link>
          </div>

          {media.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <EventMediaCard key={item.id} media={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
              <div className="text-4xl">📸</div>

              <h3 className="mt-4 text-xl font-bold">
                Be the first to share the vibe.
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/40">
                Upload your photos and videos through Pitch Your Vibe.
                Approved moments will appear here.
              </p>

              <Link
                href="/events/pitch"
                className="mt-6 inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Pitch Your Vibe →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* EVENT DESCRIPTION */}
      {event.description && (
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-4xl px-6 py-16 md:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
              About The Event
            </p>

            <div className="mt-6 whitespace-pre-line text-lg leading-9 text-white/60">
              {event.description}
            </div>
          </div>
        </section>
      )}

      {/* SHARE / CONTACT */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <div className="rounded-3xl bg-white p-8 text-black md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/40">
              Experience It With HnC
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-black md:text-5xl">
              Get your ticket. Bring your people.
            </h2>

            <p className="mt-5 max-w-2xl text-black/60">
              Tickets, community moments and the full event experience are
              being brought together in HnC Events.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#tickets"
                className="rounded-full bg-black px-7 py-3.5 text-sm font-bold text-white transition hover:bg-black/80"
              >
                Get Tickets →
              </a>

              <Link
                href="/events/pitch"
                className="rounded-full border border-black/15 px-7 py-3.5 text-sm font-bold text-black transition hover:bg-black/5"
              >
                Pitch Your Vibe →
              </Link>

              <Link
                href="/events"
                className="rounded-full border border-black/15 px-7 py-3.5 text-sm font-bold text-black transition hover:bg-black/5"
              >
                More HnC Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}