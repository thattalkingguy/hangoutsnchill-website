"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type BuyerRequest = {
  id: string;
  item_name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  max_budget: number | null;
  currency: string | null;
  preferred_city: string | null;
  preferred_state: string | null;
  preferred_country: string | null;
  needed_by: string | null;
  status: string;
  created_at: string;
};

const statusStyles: Record<string, string> = {
  open: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  matched: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  fulfilled: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  cancelled: "border-white/15 bg-white/5 text-white/60",
  expired: "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setNeedsLogin(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setNeedsLogin(true);
        setRequests([]);
        return;
      }

      const { data, error } = await supabase
        .from("hnc_buyer_requests")
        .select(
          "id, item_name, description, quantity, unit, max_budget, currency, preferred_city, preferred_state, preferred_country, needed_by, status, created_at"
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Loading buyer requests failed:", error);
        setErrorMessage(`Could not load requests: ${error.message}`);
        setRequests([]);
        return;
      }

      setRequests((data ?? []) as BuyerRequest[]);
    } catch (error) {
      console.error("Loading buyer requests failed:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load your requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function cancelRequest(requestId: string) {
    const confirmed = window.confirm(
      "Cancel this request? You can submit a new request later."
    );

    if (!confirmed) return;

    setCancellingId(requestId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setNeedsLogin(true);
        setErrorMessage("Please sign in again to cancel this request.");
        return;
      }

      const { data, error } = await supabase
        .from("hnc_buyer_requests")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .eq("buyer_id", user.id)
        .eq("status", "open")
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Cancelling buyer request failed:", error);
        setErrorMessage(`Could not cancel request: ${error.message}`);
        return;
      }

      if (!data) {
        setErrorMessage(
          "This request could not be cancelled. It may no longer be open."
        );
        await loadRequests();
        return;
      }

      setSuccessMessage("Your request has been cancelled.");
      await loadRequests();
    } catch (error) {
      console.error("Cancelling buyer request failed:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while cancelling."
      );
    } finally {
      setCancellingId(null);
    }
  }

  function formatBudget(request: BuyerRequest) {
    if (request.max_budget === null) return "Budget not specified";

    try {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: request.currency || "NGN",
        maximumFractionDigits: 2,
      }).format(request.max_budget);
    } catch {
      return `${request.currency || "NGN"} ${request.max_budget}`;
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/marketplace"
          className="text-sm text-emerald-400 hover:underline"
        >
          ← Back to Marketplace
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold">My Requests</h1>
            <p className="mt-2 text-sm text-white/60">
              View and manage the items you&apos;ve asked HnC to help you find.
            </p>
          </div>

          <Link
            href="/marketplace/request"
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
          >
            + New Request
          </Link>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
          >
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl border border-white/10 p-8 text-center text-white/60">
            Loading your requests...
          </div>
        ) : needsLogin ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center sm:p-10">
            <h2 className="text-xl font-bold">Sign in to view your requests</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
              Sign in to see the items you have requested, check their status,
              and manage your requests.
            </p>
            <Link
              href="/auth/login?next=%2Fmarketplace%2Fmy-requests"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-400 px-7 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Sign In
            </Link>
          </div>
        ) : requests.length === 0 && !errorMessage ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <h2 className="text-lg font-semibold">No requests yet</h2>
            <p className="mt-2 text-sm text-white/60">
              Submit a request and HnC can begin looking for possible matches.
            </p>
            <Link
              href="/marketplace/request"
              className="mt-5 inline-flex rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Request an Item
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {requests.map((request) => {
              const status = request.status.toLowerCase();
              const location = [
                request.preferred_city,
                request.preferred_state,
                request.preferred_country,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {request.item_name}
                      </h2>
                      <p className="mt-1 text-sm text-white/50">
                        Requested{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                        statusStyles[status] || statusStyles.open
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {request.description && (
                    <p className="mt-4 whitespace-pre-wrap text-sm text-white/70">
                      {request.description}
                    </p>
                  )}

                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-white/50">Quantity</p>
                      <p className="mt-1 font-medium">
                        {request.quantity} {request.unit || "piece"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Maximum budget</p>
                      <p className="mt-1 font-medium">
                        {formatBudget(request)}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Preferred location</p>
                      <p className="mt-1 font-medium">
                        {location || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Needed by</p>
                      <p className="mt-1 font-medium">
                        {request.needed_by
                          ? new Date(request.needed_by).toLocaleString()
                          : "No date specified"}
                      </p>
                    </div>
                  </div>

                  {status === "open" && (
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <button
                        type="button"
                        disabled={cancellingId === request.id}
                        onClick={() => void cancelRequest(request.id)}
                        className="rounded-full border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-400/10 disabled:opacity-50"
                      >
                        {cancellingId === request.id
                          ? "Cancelling..."
                          : "Cancel Request"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-xs text-white/40">
          Request status reflects the saved record. Matching and seller
          confirmation will be added in a later stage.
        </p>
      </div>
    </main>
  );
}