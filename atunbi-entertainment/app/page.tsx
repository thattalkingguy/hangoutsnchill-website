"use client";

import { FormEvent, useState } from "react";

const services = [
  ["Weddings", "Bring the right energy to your special day with live entertainment and crowd engagement."],
  ["Naming Ceremonies", "Celebrate the arrival of your little one with music, joy and unforgettable moments."],
  ["Birthdays", "From intimate celebrations to big parties, we create an atmosphere your guests will remember."],
  ["Clubs & Lounges", "Give your audience the sound, energy and entertainment they came to experience."],
  ["Corporate Events", "Professional entertainment for launches, dinners, awards, parties and company celebrations."],
  ["Concerts & Festivals", "High-energy performance and audience engagement for large events and outdoor shows."],
];

const bookingSteps = [
  "Tell us about your event.",
  "We review the date, location and service requested.",
  "We recommend the right entertainment package.",
  "You receive the booking fee and terms.",
  "A booking is confirmed after the agreed deposit is received.",
];

const spotifyProfile =
  "https://open.spotify.com/user/31p55fnfevg2jaysqvw6p6tnwdji?si=VzVZ8knGTKeWr8LSpWpIoQ&utm_source=copy-link";

const maamiTrack =
  "https://open.spotify.com/track/4BRqLvhiDKEqtAy3ikSSef?si=BvGheeN1THOWcvnC09892g&utm_source=copy-link";

const initialForm = {
  clientName: "",
  phone: "",
  email: "",
  eventType: "",
  eventDate: "",
  eventLocation: "",
  venue: "",
  guests: "",
  duration: "",
  budget: "",
  requirements: "",
  message: "",
};

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitted(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setSubmitted(false);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: form.clientName,
          phone: form.phone,
          email: form.email,
          eventType: form.eventType,
          eventDate: form.eventDate,
          eventLocation: form.eventLocation,
          venue: form.venue,
          guests: form.guests,
          duration: form.duration,
          budget: form.budget,
          requirements: form.requirements,
          message: form.message,
        }),
      });

      let result: {
        success?: boolean;
        message?: string;
      } = {};

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "The server returned an unexpected response. Please try again."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to submit your booking request. Please try again."
        );
      }

      setSubmitted(true);
      setForm(initialForm);
    } catch (submitError) {
      console.error("Booking submission error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while submitting your booking request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F1E3] text-[#17130F]">
      <nav className="sticky top-0 z-50 border-b border-[#B8954A]/20 bg-[#F7F1E3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href="#home" className="group">
            <div className="text-2xl font-black tracking-[0.08em]">
              ÀTÚNBÍ
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#A47B22]">
              Entertainment
            </div>
          </a>

          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#about" className="transition hover:text-[#A47B22]">
              About
            </a>
            <a href="#services" className="transition hover:text-[#A47B22]">
              Services
            </a>
            <a href="#music" className="transition hover:text-[#A47B22]">
              Music
            </a>
            <a href="#media" className="transition hover:text-[#A47B22]">
              Media
            </a>
            <a href="#booking" className="transition hover:text-[#A47B22]">
              Booking
            </a>
          </div>

          <a
            href="#booking"
            className="rounded-full bg-[#17130F] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22]"
          >
            Book ÀTÚNBÍ
          </a>
        </div>
      </nav>

      <section
        id="home"
        className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-10 lg:pb-28 lg:pt-20"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#B8954A]/30 bg-white/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8A671D]">
              <span className="h-2 w-2 rounded-full bg-[#B8954A]" />
              Yoruba Pride • African Entertainment
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              WE BRING
              <br />
              <span className="text-[#A47B22]">THE VIBE.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#51483E]">
              Music. Entertainment. Experiences.
              <br />
              <span className="font-semibold text-[#17130F]">
                ÀTÚNBÍ Entertainment
              </span>{" "}
              brings energy, culture and unforgettable moments to your event.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#booking"
                className="rounded-full bg-[#17130F] px-7 py-4 text-sm font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22]"
              >
                Request a Booking
              </a>

              <a
                href={spotifyProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#17130F]/20 px-7 py-4 text-sm font-bold uppercase tracking-wider transition hover:border-[#A47B22] hover:text-[#A47B22]"
              >
                🎧 Listen on Spotify
              </a>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 gap-5 border-t border-[#17130F]/10 pt-6">
              {[
                ["LIVE", "Performance"],
                ["EVENTS", "All Occasions"],
                ["VIBE", "Energy"],
              ].map(([title, text]) => (
                <div key={title}>
                  <div className="text-2xl font-black">{title}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-[#71665A]">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#17130F] shadow-2xl">
            <div className="aspect-[4/5]">
              <video
                className="h-full w-full object-cover"
                src="/AtunbiV1.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#D8B45A]">
                ÀTÚNBÍ
              </div>

              <div className="mt-2 text-2xl font-black">
                Music. Energy. Experience.
              </div>

              <div className="mt-1 text-sm text-white/70">
                Live entertainment for memorable occasions.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#B8954A]/20 bg-[#17130F] text-[#F7F1E3]">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center lg:px-10 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#D8B45A]">
            ÀTÚNBÍ
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Born from culture.
            <br />
            Built for unforgettable experiences.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-7 text-white/65">
            ÀTÚNBÍ means rebirth — a name rooted in Yoruba identity and a
            creative spirit that celebrates music, people, culture and the
            moments that bring us together.
          </p>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] bg-[#E8DDC9]">
            <img
              src="/AtunbiP1.jpeg"
              alt="ÀTÚNBÍ Entertainment"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A47B22]">
              Meet ÀTÚNBÍ
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              More than music.
              <br />
              <span className="text-[#A47B22]">
                It is an experience.
              </span>
            </h2>

            <p className="mt-6 leading-8 text-[#51483E]">
              ÀTÚNBÍ Entertainment is built around one simple idea: every event
              deserves the right atmosphere.
            </p>

            <p className="mt-4 leading-8 text-[#51483E]">
              From weddings and naming ceremonies to birthdays, clubs,
              corporate events, concerts and private celebrations, we bring
              music, personality and audience engagement together.
            </p>

            <div className="mt-8 border-l-4 border-[#B8954A] pl-5">
              <p className="text-xl font-bold italic">
                “Culture in the heart. Entertainment in the soul.”
              </p>
            </div>

            <h2
              id="music"
              className="mt-12 text-4xl font-black leading-tight sm:text-5xl"
            >
              Listen to the music.
              <br />
              <span className="text-[#A47B22]">Feel the energy.</span>
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-[#62574B]">
              Music is at the heart of ÀTÚNBÍ. Discover the sound behind the
              entertainment and experience the music before you book the
              talent.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-[#B8954A]/25 bg-[#F7F1E3] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A47B22]">
                Featured Track
              </p>

              <h3 className="mt-3 text-2xl font-black">Maami</h3>

              <p className="mt-1 text-sm text-[#71665A]">ÀTÚNBÍ</p>

              <a
                href={maamiTrack}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-full bg-[#17130F] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22]"
              >
                🎧 Listen to Maami
              </a>
            </div>

            <a
              href={spotifyProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex text-sm font-bold text-[#A47B22] hover:underline"
            >
              Explore ÀTÚNBÍ on Spotify →
            </a>

            <div className="mt-10 overflow-hidden rounded-[2rem] bg-[#17130F] shadow-xl">
              <img
                src="/AtunbiP2.jpeg"
                alt="ÀTÚNBÍ"
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#F7F1E3]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A47B22]">
              Event Services
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              Tell us the occasion.
              <br />
              <span className="text-[#A47B22]">
                We bring the energy.
              </span>
            </h2>

            <p className="mt-5 leading-7 text-[#62574B]">
              From intimate celebrations to major events, choose the
              entertainment service that fits your occasion.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(([title, text], index) => (
              <div
                key={title}
                className="group rounded-[1.5rem] border border-[#B8954A]/20 bg-white/40 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#B8954A]/60 hover:shadow-xl"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17130F] text-sm font-black text-[#D8B45A]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3 className="mt-6 text-xl font-black">{title}</h3>

                <p className="mt-3 text-sm leading-6 text-[#665B50]">
                  {text}
                </p>

                <a
                  href="#booking"
                  className="mt-6 inline-block text-xs font-bold uppercase tracking-wider text-[#A47B22]"
                >
                  Request Service →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A47B22]">
              Simple Booking
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              How booking
              <br />
              <span className="text-[#A47B22]">works.</span>
            </h2>

            <p className="mt-5 leading-7 text-[#62574B]">
              Every booking starts with understanding your event. Fees depend
              on the requested service, date, location, duration and event
              requirements.
            </p>
          </div>

          <div className="space-y-4">
            {bookingSteps.map((step, index) => (
              <div
                key={step}
                className="flex gap-5 rounded-2xl border border-[#17130F]/10 bg-white/40 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17130F] text-sm font-black text-[#D8B45A]">
                  {index + 1}
                </div>

                <p className="pt-2 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="media" className="bg-[#17130F] text-[#F7F1E3]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D8B45A]">
                Media
              </p>

              <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                See the vibe.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-white/55">
              A glimpse of ÀTÚNBÍ in performance...
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] bg-black">
              <video
                className="aspect-video w-full object-cover"
                src="/AtunbiV1.mp4"
                controls
                playsInline
                preload="metadata"
              />
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-black">
              <video
                className="aspect-video w-full object-cover"
                src="/AtunbiV2.mp4"
                controls
                playsInline
                preload="metadata"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] bg-[#29231D]">
              <img
                src="/AtunbiP1.jpeg"
                alt="ÀTÚNBÍ performance"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-[#29231D]">
              <img
                src="/AtunbiP2.jpeg"
                alt="ÀTÚNBÍ"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="booking"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"
      >
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A47B22]">
              Book ÀTÚNBÍ
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Let&apos;s make your
              <br />
              <span className="text-[#A47B22]">
                event memorable.
              </span>
            </h2>

            <p className="mt-6 leading-7 text-[#62574B]">
              Submit your event details and the entertainment team can review
              the request and respond with availability, service details and
              the appropriate booking fee.
            </p>

            <div className="mt-8 rounded-2xl bg-[#17130F] p-6 text-[#F7F1E3]">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8B45A]">
                Booking Note
              </p>

              <p className="mt-3 text-sm leading-6 text-white/65">
                Booking fees vary according to event type, location, date,
                duration, performance requirements and other agreed services.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-[#B8954A]/20 bg-white/50 p-6 shadow-xl sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="clientName"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Full Name
                </label>

                <input
                  id="clientName"
                  name="clientName"
                  type="text"
                  value={form.clientName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="eventType"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Event Type
                </label>

                <select
                  id="eventType"
                  name="eventType"
                  value={form.eventType}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                >
                  <option value="" disabled>
                    Select event
                  </option>
                  <option>Wedding</option>
                  <option>Naming Ceremony</option>
                  <option>Birthday</option>
                  <option>Club / Lounge</option>
                  <option>Corporate Event</option>
                  <option>Concert / Festival</option>
                  <option>Private Event</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="eventDate"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Event Date
                </label>

                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="eventLocation"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Location
                </label>

                <input
                  id="eventLocation"
                  name="eventLocation"
                  type="text"
                  value={form.eventLocation}
                  onChange={handleChange}
                  placeholder="City / Location"
                  required
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="venue"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Venue
                </label>

                <input
                  id="venue"
                  name="venue"
                  type="text"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="Venue name (optional)"
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="guests"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Expected Guests
                </label>

                <input
                  id="guests"
                  name="guests"
                  type="number"
                  min="1"
                  value={form.guests}
                  onChange={handleChange}
                  placeholder="Approx. number"
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Duration
                </label>

                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 2 hours"
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Budget
                </label>

                <input
                  id="budget"
                  name="budget"
                  type="text"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="mt-2 w-full rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
                />
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="requirements"
                className="text-xs font-bold uppercase tracking-wider"
              >
                Special Requirements
              </label>

              <textarea
                id="requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="Sound, MC, performance style, special requests, etc."
                className="mt-2 w-full resize-none rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="message"
                className="text-xs font-bold uppercase tracking-wider"
              >
                Tell us about the event
              </label>

              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder="What would you like ÀTÚNBÍ Entertainment to provide?"
                className="mt-2 w-full resize-none rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 outline-none focus:border-[#A47B22]"
              />
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                {error}
              </div>
            )}

            {submitted && (
              <div className="mt-5 rounded-xl border border-[#B8954A]/40 bg-[#FFF7E6] px-4 py-4 text-sm leading-6 text-[#17130F]">
                <p className="font-bold">Booking request received.</p>

                <p className="mt-1">
                  Thank you. ÀTÚNBÍ Entertainment will review your request and
                  respond with availability, terms and booking details.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-[#17130F] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting Request..." : "Submit Booking Request"}
            </button>

            <p className="mt-4 text-center text-xs text-[#766A5E]">
              Your request does not confirm a booking until availability,
              terms and fees are agreed.
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#B8954A]/20 bg-[#EDE3D1]">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center lg:px-10">
          <div className="text-sm text-[#17130F]">
            ÀTÚNBÍ Entertainment
          </div>

          <div className="mt-1 text-sm text-[#62574B]">
            musicatunbi@gmail.com
          </div>

          <div className="mt-1 text-xs text-[#766A5E]">
            © 2026 ÀTÚNBÍ Entertainment. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
