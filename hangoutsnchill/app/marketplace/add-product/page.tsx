
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AddProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("1");
  const [currency, setCurrency] = useState("NGN");
  const [productType, setProductType] = useState("physical");
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [weight, setWeight] = useState("");
  const [sellerCity, setSellerCity] = useState("");
  const [sellerState, setSellerState] = useState("");
  const [sellerCountry, setSellerCountry] = useState("Nigeria");
  const [freshnessNotes, setFreshnessNotes] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();
    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericWeight =
      weight.trim() === "" ? null : Number(weight);

    if (!cleanTitle || !cleanCategory) {
      setErrorMessage("Enter a product name and category.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMessage("Enter a valid price greater than zero.");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setErrorMessage("Stock must be a whole number of zero or more.");
      return;
    }

    if (
      numericWeight !== null &&
      (!Number.isFinite(numericWeight) || numericWeight < 0)
    ) {
      setErrorMessage("Weight must be zero or greater.");
      return;
    }

    if (availableUntil && new Date(availableUntil) <= new Date()) {
      setErrorMessage("Availability expiry must be in the future.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("You must be logged in to add a product.");
        return;
      }

      const product = {
        title: cleanTitle,
        description: cleanDescription || null,
        price: numericPrice,
        category: cleanCategory,
        image_url: imageUrl.trim() || null,
        product_type: productType,
        stock: numericStock,
        seller_id: user.id,
        user_id: user.id,
        status: "published",
        currency,
        delivery_type: deliveryType,
        weight: numericWeight,
        seller_city: sellerCity.trim() || null,
        seller_state: sellerState.trim() || null,
        seller_country: sellerCountry.trim() || "Nigeria",
        freshness_notes: freshnessNotes.trim() || null,
        available_until: availableUntil
          ? new Date(availableUntil).toISOString()
          : null,
        availability_confirmed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("products")
        .insert(product);

      if (error) {
        console.error("Product insert failed:", error);
        setErrorMessage(
          `Could not save product: ${error.message}`
        );
        return;
      }

      setSuccessMessage("Product published successfully.");

      router.push("/marketplace/my-products");
      router.refresh();
    } catch (error) {
      console.error("Add product failed:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your product."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-400";

  const labelClass =
    "mb-2 block text-sm font-medium text-white/80";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            href="/marketplace"
            className="text-sm text-emerald-400 hover:underline"
          >
            ← Back to Marketplace
          </Link>

          <h1 className="mt-5 text-3xl font-bold">
            Add a Product
          </h1>

          <p className="mt-2 text-sm text-white/60">
            List what you sell and tell buyers where and when it
            is available.
          </p>
        </div>

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
            <label className={labelClass}>Product name *</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fresh tomatoes"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product, quality and condition"
              rows={4}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Price *</label>
              <input
                className={inputClass}
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
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
              <label className={labelClass}>Category *</label>
              <input
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Food, Fashion, Electronics"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Available stock *</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Product type</label>
              <select
                className={inputClass}
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                <option value="physical">Physical product</option>
                <option value="digital">Digital product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Fulfilment</label>
              <select
                className={inputClass}
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
              >
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="both">Pickup or delivery</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Weight (kg), if applicable
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <label className={labelClass}>Product image URL</label>
              <input
                className={inputClass}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold">
              Seller location and availability
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Help nearby buyers and HnC delivery find your products.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>City or town</label>
              <input
                className={inputClass}
                value={sellerCity}
                onChange={(e) => setSellerCity(e.target.value)}
                placeholder="e.g. Ijebu-Ode"
              />
            </div>

            <div>
              <label className={labelClass}>State</label>
              <input
                className={inputClass}
                value={sellerState}
                onChange={(e) => setSellerState(e.target.value)}
                placeholder="e.g. Ogun"
              />
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <input
                className={inputClass}
                value={sellerCountry}
                onChange={(e) => setSellerCountry(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Available until (optional)
              </label>
              <input
                className={inputClass}
                type="datetime-local"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Freshness or availability notes
            </label>
            <textarea
              className={inputClass}
              value={freshnessNotes}
              onChange={(e) => setFreshnessNotes(e.target.value)}
              placeholder="e.g. Harvested today; confirm quantity before ordering"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving product..." : "Publish product"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/marketplace")}
              className="rounded-full border border-white/20 px-6 py-3 font-semibold transition hover:bg-white/5"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-white/50">
            Publishing makes the listing available according to your
            marketplace access policies. Keep stock and availability
            details accurate.
          </p>
        </form>
      </div>
    </main>
  );
}
