"use client";

import { useState } from "react";

const initialState = {
  clientName: "",
  phone: "",
  email: "",
  eventType: "",
  eventDate: "",
  eventLocation: "",
  venue: "",
  guests: "",
  duration: "",
  artist: "ATUNBI",
  budget: "",
  requirements: "",
  message: "",
};

export default function BookingForm() {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setForm(initialState);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#1f242b]">
            Client Name
            <input
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>

          <label className="space-y-2 text-sm text-[#1f242b]">
            Phone Number
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#1f242b]">
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>

          <label className="space-y-2 text-sm text-[#1f242b]">
            Event Type
            <select
              name="eventType"
              value={form.eventType}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            >
              <option value="">Choose an event type</option>
              <option value="Wedding">Wedding</option>
              <option value="Naming Ceremony">Naming Ceremony</option>
              <option value="Birthday">Birthday</option>
              <option value="Private Party">Private Party</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Club / Lounge">Club / Lounge</option>
              <option value="Concert / Festival">Concert / Festival</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#1f242b]">
            Event Date
            <input
              name="eventDate"
              type="date"
              value={form.eventDate}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>

          <label className="space-y-2 text-sm text-[#1f242b]">
            Event Location
            <input
              name="eventLocation"
              value={form.eventLocation}
              onChange={handleChange}
              required
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#1f242b]">
            Venue
            <input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>

          <label className="space-y-2 text-sm text-[#1f242b]">
            Expected Number of Guests
            <input
              name="guests"
              type="number"
              value={form.guests}
              onChange={handleChange}
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#1f242b]">
            Preferred Performance Duration
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 30 minutes, 1 hour"
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>

          <label className="space-y-2 text-sm text-[#1f242b]">
            Artist Requested
            <input
              name="artist"
              value={form.artist}
              onChange={handleChange}
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#1f242b]">
            Budget Range
            <input
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. ₦250,000 - ₦500,000"
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>

          <label className="space-y-2 text-sm text-[#1f242b]">
            Special Requirements
            <input
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              placeholder="Sound, production, lighting, travel"
              className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-[#1f242b]">
          Additional Message
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-3xl border border-[#d8c3ab] bg-[#f8f0e6] px-4 py-3 text-sm text-[#1f242b] outline-none transition focus:border-[#1f242b] focus:ring-2 focus:ring-[#b28640]/20"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-[#1f242b] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#3e4661]"
        >
          SUBMIT BOOKING REQUEST
        </button>
      </form>

      {submitted ? (
        <div className="mt-8 rounded-[28px] border border-[#b28640] bg-[#fff7e6] p-6 text-sm leading-7 text-[#1f242b] shadow-sm">
          <p className="font-semibold">Thank you. Your booking request has been received.</p>
          <p className="mt-3">
            Atunbi Entertainment will review your request and contact you shortly.
          </p>
        </div>
      ) : null}
    </div>
  );
}
