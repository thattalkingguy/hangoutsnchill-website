
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BuyerRequestPage() {
  const router = useRouter();

  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("piece");
  const [maxBudget, setMaxBudget] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [preferredCity, setPreferredCity] = useState("");
  const [preferredState, setPreferredState] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("Nigeria");
  const [neededBy, setNeededBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanName = itemName.trim();
    const numericQuantity = Number(quantity);
    const numericBudget =
      maxBudget.trim() === "" ? null : Number(maxBudget);

    if (!cleanName) {
      setErrorMessage("Please enter the item you need.");
      return;
    }

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      setErrorMessage("Enter a valid quantity greater than zero.");
      return;
    }

    if (
      numericBudget !== null &&
      (!Number.isFinite(numericBudget) || numericBudget < 0)
    ) {
      setErrorMessage("Enter a valid budget or leave it blank.");
      return;
    }

    if (neededBy && new Date(neededBy) <= new Date()) {
      setErrorMessage("The required date must be in the future.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setErrorMessage("Please sign in before submitting a request.");
        return;
      }

      const { error } = await supabase
        .from("hnc_buyer_requests")
        .insert({
          buyer_id: user.id,
          item_name: cleanName,
          description: description.trim() || null,
          quantity: numericQuantity,
          unit: unit.trim() || "piece",
          max_budget: numericBudget,
          currency,
          preferred_city: preferredCity.trim() || null,
          preferred_state: preferredState.trim() || null,
          preferred_country: preferredCountry.trim() || "Nigeria",
          needed_by: neededBy
            ? new Date(neededBy).toISOString()
            : null,
          status: "open",
        });

      if (error) {
        console.error("Buyer request insert failed:", error);
        setErrorMessage(`Could not submit request: ${error.message}`);
        return;
      }

      setSuccessMessage("Your request has been submitted.");
      router.push("/marketplace/my-requests");
      router.refresh();
    } catch (error) {
      console.error("Buyer request failed:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-400";

  const labelClass = "mb-2 block text-sm font-medium text-white/80";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/marketplace"
          className="text-sm text-emerald-400 hover:underline"
        >
          ← Back to Marketplace
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          Request an Item
        </h1>
        <p className="mt-2 mb-8 text-sm text-white/60">
          Tell HnC what you need. We'll use your request to help find
          available sellers.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-8"
        >
          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200"
            >
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"
            >
              {successMessage}
            </div>
          )}

          <div>
            <label className={labelClass}>What do you need? *</label>
            <input
              className={inputClass}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. 10 bags of rice"
              maxLength={150}
              required
            />
          </div>

          <div>
            <label className={labelClass}>More details</label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the brand, size, quality or other requirements"
              rows={4}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Quantity *</label>
              <input
                className={inputClass}
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Unit</label>
              <select
                className={inputClass}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="piece">Piece</option>
                <option value="pack">Pack</option>
                <option value="carton">Carton</option>
                <option value="bag">Bag</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="litre">Litre</option>
                <option value="dozen">Dozen</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Maximum budget (optional)</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="Your budget"
              />
            </div>

            <div>
              <label className={labelClass}>Currency</label>
              <select
                className={inputClass}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="NGN">NGN — Naira</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — Pound Sterling</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Preferred city or town</label>
              <input
                className={inputClass}
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                placeholder="e.g. Ijebu-Ode"
              />
            </div>

            <div>
              <label className={labelClass}>State</label>
              <input
                className={inputClass}
                value={preferredState}
                onChange={(e) => setPreferredState(e.target.value)}
                placeholder="e.g. Ogun"
              />
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <input
                className={inputClass}
                value={preferredCountry}
                onChange={(e) => setPreferredCountry(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>When do you need it?</label>
              <input
                className={inputClass}
                type="datetime-local"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Submitting request..." : "Submit Buyer Request"}
          </button>

          <p className="text-xs text-white/50">
            Submitting a request does not guarantee availability or a
            particular price. Sellers and fulfilment details must be
            confirmed before an order is placed.
          </p>
        </form>
      </div>
    </main>
  );
}
