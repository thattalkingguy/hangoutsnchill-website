"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Booking = {
  id: string;
  client_name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  event_location: string;
  venue: string | null;
  guests: number | null;
  duration: string | null;
  artist: string;
  budget: string | null;
  requirements: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const statusOptions = [
  "pending",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /*
   * Get the currently logged-in Supabase user's access token.
   * The API requires this token before it will return bookings.
   */
  async function getAccessToken() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(
        sessionError.message ||
          "Unable to verify your admin session."
      );
    }

    if (!session?.access_token) {
      throw new Error(
        "Your admin session has expired. Please log in again."
      );
    }

    return session.access_token;
  }

  /*
   * Load all bookings from the protected admin API.
   */
  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

      const accessToken = await getAccessToken();

      const response = await fetch("/api/admin/bookings", {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "This account is not authorized to access the admin dashboard."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load booking requests."
        );
      }

      setBookings(data.bookings || []);
    } catch (loadError) {
      console.error(
        "ÀTÚNBÍ booking dashboard error:",
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load booking requests."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Load bookings when the dashboard opens.
   */
  useEffect(() => {
    loadBookings();
  }, []);

  /*
   * Update booking status.
   *
   * The same Supabase access token is sent to the protected
   * PATCH API so the server knows this is an authenticated admin.
   */
  async function updateStatus(
    bookingId: string,
    newStatus: string
  ) {
    const previousBookings = [...bookings];

    setUpdatingId(bookingId);
    setError("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus,
        }),
      });

      const rawResponse = await response.text();

      let data: {
        success?: boolean;
        message?: string;
        booking?: Booking;
        emailSent?: boolean;
      };

      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (response.status === 401) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "This account is not authorized to manage bookings."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update booking status."
        );
      }

      if (!data.booking) {
        throw new Error(
          "Status was updated but no booking was returned."
        );
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? data.booking!
            : booking
        )
      );
    } catch (updateError) {
      console.error(
        "ÀTÚNBÍ booking status update error:",
        updateError
      );

      setBookings(previousBookings);

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update booking status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  /*
   * Format the event date.
   */
  function formatDate(date: string) {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /*
   * Format the date/time the booking was submitted.
   */
  function formatSubmittedDate(date: string) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function statusLabel(status: string) {
    if (!status) return "Unknown";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  function statusClasses(status: string) {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";

      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";

      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";

      case "contacted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      default:
        return "bg-[#17130F] text-[#D8B45A] border-[#17130F]";
    }
  }

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const contactedCount = bookings.filter(
    (booking) => booking.status === "contacted"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-[#F7F1E3] text-[#17130F]">
      <header className="border-b border-[#B8954A]/20 bg-[#17130F] text-[#F7F1E3]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-6 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D8B45A]">
              ÀTÚNBÍ Entertainment
            </p>

            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Booking Dashboard
            </h1>

            <p className="mt-2 text-sm text-white/60">
              Manage client booking requests and update their status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="shrink-0 rounded-full border border-[#D8B45A]/40 px-5 py-3 text-xs font-bold uppercase tracking-wider transition hover:bg-[#D8B45A] hover:text-[#17130F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        {/* Dashboard summary */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-[#B8954A]/20 bg-white/60 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#71665A]">
              Total Requests
            </p>

            <p className="mt-2 text-4xl font-black">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#B8954A]/20 bg-white/60 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#71665A]">
              Pending
            </p>

            <p className="mt-2 text-4xl font-black">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#B8954A]/20 bg-white/60 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#71665A]">
              Contacted
            </p>

            <p className="mt-2 text-4xl font-black">
              {contactedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#B8954A]/20 bg-white/60 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#71665A]">
              Confirmed
            </p>

            <p className="mt-2 text-4xl font-black">
              {confirmedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#B8954A]/20 bg-white/60 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#71665A]">
              Completed
            </p>

            <p className="mt-2 text-4xl font-black">
              {completedCount}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-bold">
              Something went wrong
            </p>

            <p className="mt-2 text-sm leading-6">
              {error}
            </p>

            {error
              .toLowerCase()
              .includes("log in again") && (
              <a
                href="/admin/login"
                className="mt-4 inline-flex rounded-full bg-[#17130F] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#F7F1E3] transition hover:bg-[#A47B22]"
              >
                Go to Admin Login
              </a>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-[#B8954A]/20 bg-white/60 p-12 text-center">
            <p className="font-semibold">
              Loading booking requests...
            </p>

            <p className="mt-2 text-sm text-[#71665A]">
              Please wait.
            </p>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl border border-[#B8954A]/20 bg-white/60 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#17130F] text-2xl text-[#D8B45A]">
              ✓
            </div>

            <p className="mt-6 text-xl font-black">
              No booking requests yet.
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71665A]">
              New ÀTÚNBÍ Entertainment booking requests
              submitted through the website will appear here.
            </p>
          </div>
        ) : (
          /* Bookings */
          <div className="space-y-5">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[1.5rem] border border-[#B8954A]/20 bg-white/70 p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Booking header */}
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black">
                        {booking.client_name}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClasses(
                          booking.status
                        )}`}
                      >
                        {statusLabel(booking.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#A47B22]">
                      {booking.event_type}
                    </p>
                  </div>

                  <div className="text-sm text-[#71665A] lg:text-right">
                    <p className="font-semibold">
                      Event: {formatDate(booking.event_date)}
                    </p>

                    <p className="mt-1">
                      Submitted:{" "}
                      {formatSubmittedDate(
                        booking.created_at
                      )}
                    </p>
                  </div>
                </div>

                {/* Main information */}
                <div className="mt-6 grid gap-5 border-t border-[#17130F]/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                      Phone
                    </p>

                    {booking.phone ? (
                      <a
                        href={`tel:${booking.phone}`}
                        className="mt-1 block font-semibold text-[#17130F] hover:text-[#A47B22] hover:underline"
                      >
                        {booking.phone}
                      </a>
                    ) : (
                      <p className="mt-1 font-semibold">—</p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                      Email
                    </p>

                    {booking.email ? (
                      <a
                        href={`mailto:${booking.email}`}
                        className="mt-1 block break-words font-semibold text-[#17130F] hover:text-[#A47B22] hover:underline"
                      >
                        {booking.email}
                      </a>
                    ) : (
                      <p className="mt-1 font-semibold">—</p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                      Location
                    </p>

                    <p className="mt-1 font-semibold">
                      {booking.event_location || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                      Guests
                    </p>

                    <p className="mt-1 font-semibold">
                      {booking.guests ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Extra event information */}
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {booking.venue && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                        Venue
                      </p>

                      <p className="mt-1 text-sm leading-6">
                        {booking.venue}
                      </p>
                    </div>
                  )}

                  {booking.duration && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                        Duration
                      </p>

                      <p className="mt-1 text-sm leading-6">
                        {booking.duration}
                      </p>
                    </div>
                  )}

                  {booking.budget && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                        Budget
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {booking.budget}
                      </p>
                    </div>
                  )}
                </div>

                {/* Client message */}
                {booking.message && (
                  <div className="mt-5 rounded-xl bg-[#F7F1E3] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#A47B22]">
                      Client Message
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#51483E]">
                      {booking.message}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                {booking.requirements && (
                  <div className="mt-4 rounded-xl bg-[#F7F1E3] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#A47B22]">
                      Special Requirements
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#51483E]">
                      {booking.requirements}
                    </p>
                  </div>
                )}

                {/* Footer controls */}
                <div className="mt-6 flex flex-col gap-5 border-t border-[#17130F]/10 pt-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]">
                      Booking ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-[#62574B]">
                      {booking.id}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    <label
                      htmlFor={`status-${booking.id}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#8A7B6B]"
                    >
                      Update Booking Status
                    </label>

                    <select
                      id={`status-${booking.id}`}
                      value={booking.status}
                      disabled={
                        updatingId === booking.id
                      }
                      onChange={(event) =>
                        updateStatus(
                          booking.id,
                          event.target.value
                        )
                      }
                      className="min-w-[190px] rounded-xl border border-[#17130F]/10 bg-[#F7F1E3] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#A47B22] disabled:cursor-wait disabled:opacity-60"
                    >
                      {statusOptions.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>

                    {updatingId === booking.id && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#A47B22]">
                        Updating and sending notification...
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}