import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Event = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  event_date: string;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  state: string | null;
  hero_image_url: string | null;
  status: string;
  featured: boolean;
  before_video_url: string | null;
  before_youtube_url: string | null;
  after_video_url: string | null;
  after_youtube_url: string | null;
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

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function VideoSnippet({
  videoUrl,
  youtubeUrl,
  label,
}: {
  videoUrl: string | null;
  youtubeUrl: string | null;
  label: string;
}) {
  if (!videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03]">
        <div className="text-center">
          <div className="text-3xl">🎬</div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
            {label}
          </p>

          <p className="mt-2 text-xs text-white/25">
            Video coming soon
          </p>
        </div>
      </div>
    );
  }

  const videoContent = (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black">
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="aspect-video h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
            HnC Events
          </p>

          <p className="mt-1 text-sm font-bold text-white">
            {label}
          </p>
        </div>

        {youtubeUrl && (
          <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-black transition group-hover:bg-white/85">
            Watch on YouTube →
          </span>
        )}
      </div>
    </div>
  );

  if (youtubeUrl) {
    return (
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} - Watch on YouTube`}
      >
        {videoContent}
      </a>
    );
  }

  return videoContent;
}

function CommunityMediaCard({ media }: { media: EventMedia }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
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
            alt={media.title || "HnC event community media"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">
          {media.media_type === "video"
            ? "Community Video"
            : "Community Photo"}
        </p>

        {media.title && (
          <h3 className="mt-2 text-sm font-bold text-white">
            {media.title}
          </h3>
        )}

        {media.caption && (
          <p className="mt-2 text-sm leading-6 text-white/50">
            {media.caption}
          </p>
        )}
      </div>
    </article>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="relative aspect-[16/10] bg-white/5">
        {event.hero_image_url ? (
          <img
            src={event.hero_image_url}
            alt={event.title}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-white/30">
              HnC Events
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold">{event.title}</h3>

        <p className="mt-3 text-sm text-white/50">
          {event.short_description || "Discover this HnC event."}
        </p>

        <div className="mt-5 space-y-2 text-sm text-white/70">
          <div>📅 {formatEventDate(event.event_date)}</div>

          {event.city && (
            <div>
              📍 {event.city}
              {event.state ? `, ${event.state}` : ""}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
          >
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let events: Event[] = [];
  let communityMedia: EventMedia[] = [];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey
    );

    const { data } = await supabase
      .from("events")
      .select(`
        id,
        slug,
        title,
        short_description,
        description,
        event_date,
        venue_name,
        venue_address,
        city,
        state,
        hero_image_url,
        status,
        featured,
        before_video_url,
        before_youtube_url,
        after_video_url,
        after_youtube_url
      `)
      .in("status", ["published", "sold_out"])
      .order("event_date", { ascending: true });

    events = data ?? [];

    const featuredEvent =
      events.find((event) => event.featured) ?? events[0];

    if (featuredEvent) {
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
        .eq("event_id", featuredEvent.id)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      communityMedia = (mediaData ?? []) as EventMedia[];
    }
  }

  const featuredEvent =
    events.find((event) => event.featured) ?? events[0];

  const otherEvents = events.filter(
    (event) => event.id !== featuredEvent?.id
  );

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/50">
              HangoutsNChill
            </p>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl">
              HnC EVENTS
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
              Discover events. Get your tickets. Meet people.
              Experience the moment.
            </p>
          </div>

          {featuredEvent ? (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
              <div className="grid lg:grid-cols-2">
                {/* POSTER */}
                <div className="relative flex min-h-[420px] items-center justify-center bg-black p-4 md:min-h-[560px] md:p-8">
                  {featuredEvent.hero_image_url ? (
                    <img
                      src={featuredEvent.hero_image_url}
                      alt={featuredEvent.title}
                      className="max-h-[540px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full min-h-[320px] items-center justify-center">
                      <span className="text-sm uppercase tracking-[0.3em] text-white/30">
                        HnC Events
                      </span>
                    </div>
                  )}
                </div>

                {/* EVENT INFORMATION + VIDEO */}
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <div className="mb-4 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/60">
                    {featuredEvent.status === "sold_out"
                      ? "Sold Out"
                      : "Featured Event"}
                  </div>

                  <h2 className="text-3xl font-black md:text-5xl">
                    {featuredEvent.title}
                  </h2>

                  <p className="mt-5 text-white/60">
                    {featuredEvent.short_description ||
                      featuredEvent.description ||
                      "Experience this event with HnC."}
                  </p>

                  <div className="mt-7 space-y-3 text-sm text-white/70">
                    <div>
                      📅 {formatEventDate(featuredEvent.event_date)}
                    </div>

                    {featuredEvent.venue_name && (
                      <div>
                        📍 {featuredEvent.venue_name}
                        {featuredEvent.city
                          ? `, ${featuredEvent.city}`
                          : ""}
                      </div>
                    )}
                  </div>

                  {/* BEFORE EVENT VIDEO */}
                  <div className="mt-8">
                    <VideoSnippet
                      videoUrl={featuredEvent.before_video_url}
                      youtubeUrl={featuredEvent.before_youtube_url}
                      label="5-Second Event Promo"
                    />
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/events/${featuredEvent.slug}`}
                      className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:bg-white/85"
                    >
                      View Event →
                    </Link>

                    <Link
                      href="/events/pitch"
                      className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      Pitch Your Vibe →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-12 text-center">
              <div className="text-4xl">🎟️</div>

              <h2 className="mt-5 text-2xl font-bold">
                Events are loading
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-white/50">
                New experiences are coming to HnC Events.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED EVENT MEDIA */}
      {featuredEvent && (
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
            <div className="mb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
                HnC Event Media
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                Before & After
              </h2>

              <p className="mt-3 max-w-2xl text-white/45">
                Short event snippets before the experience and
                recap moments after it happens.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <VideoSnippet
                videoUrl={featuredEvent.before_video_url}
                youtubeUrl={featuredEvent.before_youtube_url}
                label="5-Second Event Promo"
              />

              <VideoSnippet
                videoUrl={featuredEvent.after_video_url}
                youtubeUrl={featuredEvent.after_youtube_url}
                label="5-Second Event Recap"
              />
            </div>
          </div>
        </section>
      )}

      {/* COMMUNITY GALLERY */}
      {featuredEvent && (
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
                  Real moments submitted by the people experiencing
                  HnC Events. Approved photos and videos appear here.
                </p>
              </div>

              <Link
                href="/events/pitch"
                className="inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/85"
              >
                Share Your Moment →
              </Link>
            </div>

            {communityMedia.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {communityMedia.map((media) => (
                  <CommunityMediaCard
                    key={media.id}
                    media={media}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
                <div className="text-4xl">📸</div>

                <h3 className="mt-4 text-xl font-bold">
                  The gallery is waiting for you.
                </h3>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/45">
                  Share up to 3 photos and 3 videos from your
                  experience. After HnC review, approved moments
                  will appear here.
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
      )}

      {/* UPCOMING EVENTS */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
            Discover
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            Upcoming Events
          </h2>
        </div>

        {otherEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
            {featuredEvent
              ? "More events will appear here as planners publish them."
              : "No upcoming events yet."}
          </div>
        )}
      </section>

      {/* EVENT PLANNERS */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <div className="rounded-3xl bg-white p-8 text-black md:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/40">
              Event Planners
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-black md:text-5xl">
              Bring your event to HnC.
            </h2>

            <p className="mt-5 max-w-2xl text-black/60">
              Tell us about your event. HnC can help turn your
              event information, media, ticketing and campaign
              into a complete digital event experience.
            </p>

            <Link
              href="/events/submit"
              className="mt-8 inline-flex rounded-full bg-black px-7 py-3.5 text-sm font-bold text-white transition hover:bg-black/80"
            >
              Submit Your Event →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}