"use client";

import { useState, type FormEvent } from "react";

export default function SubmitEventPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const title = String(form.get("title") || "").trim();
    const date = String(form.get("date") || "").trim();
    const location = String(form.get("location") || "").trim();
    const description = String(form.get("description") || "").trim();

    if (!name || !email || !title || !location || !description) {
      setError("Please complete all required fields.");
      return;
    }

    const subject = encodeURIComponent(`HnC Event Submission: ${title}`);
    const body = encodeURIComponent(
      `EVENT SUBMISSION\n\n` +
      `Contact name: ${name}\n` +
      `Contact email: ${email}\n` +
      `Event title: ${title}\n` +
      `Event date: ${date || "Not specified"}\n` +
      `Event location: ${location}\n\n` +
      `Event description:\n${description}\n\n` +
      `Submitted through HangoutsNChill Events.`
    );

    setSubmitted(true);
    window.location.href =
      `mailto:hangoutsnchill@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-14 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <a href="/events" className="text-sm font-semibold text-neutral-400 hover:text-white">
          ← Back to HnC Events
        </a>

        <header className="mb-10 mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-400">
            Event Planners
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Bring your event to HnC.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-neutral-300">
            Tell us about your concert, party, conference or community event.
            Our team can review your details and discuss event promotion,
            media, ticketing and campaign support.
          </p>
        </header>

        {submitted ? (
          <section className="rounded-3xl border border-emerald-800 bg-emerald-950/40 p-7">
            <h2 className="text-2xl font-bold">Your email draft is ready</h2>
            <p className="mt-3 leading-7 text-neutral-200">
              Your email app should open with the event details prepared.
              Please send the email to complete your submission. If no email
              app opens, copy your details and email hangoutsnchill@gmail.com.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 rounded-full bg-white px-5 py-3 font-bold text-black"
            >
              Return to form
            </button>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl bg-white p-6 text-neutral-900 md:p-10"
          >
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-bold">
                Your name *
              </label>
              <input
                id="name"
                name="name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Event organiser or contact person"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-bold">
                Event title *
              </label>
              <input
                id="title"
                name="title"
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Name of your event"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-bold">
                  Event date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-bold">
                  Event location *
                </label>
                <input
                  id="location"
                  name="location"
                  required
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="Town or venue"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-bold">
                Tell us about your event *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                className="w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Describe the event, performers, audience and the support you need from HnC."
              />
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-black px-6 py-4 font-bold text-white transition hover:bg-neutral-800"
            >
              Prepare Event Submission →
            </button>

            <p className="text-xs leading-5 text-neutral-500">
              This form prepares an email; it does not automatically store or
              send your submission. You must send the email from your email app.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
