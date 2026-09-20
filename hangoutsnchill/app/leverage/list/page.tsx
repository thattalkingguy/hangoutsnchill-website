"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

const assetCategories = [
  "Real Estate",
  "Business",
  "Equipment",
  "Agriculture",
  "Energy",
  "Project",
  "Other",
];

const currencies = [
  "USD",
  "NGN",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "AED",
  "ZAR",
];

export default function ListAssetPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetCategory, setAssetCategory] =
    useState("Real Estate");

  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [askingPrice, setAskingPrice] = useState("");
  const [currency, setCurrency] = useState("USD");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCountry = country.trim();
    const cleanStateRegion = stateRegion.trim();
    const cleanCity = city.trim();
    const cleanAddress = address.trim();

    const numericAskingPrice =
      askingPrice.trim() === ""
        ? null
        : Number(askingPrice);

    if (!cleanTitle) {
      setErrorMessage("Asset title is required.");
      return;
    }

    if (!cleanDescription) {
      setErrorMessage(
        "Please provide a description of the asset."
      );
      return;
    }

    if (!cleanCountry) {
      setErrorMessage("Country is required.");
      return;
    }

    if (
      numericAskingPrice !== null &&
      (!Number.isFinite(numericAskingPrice) ||
        numericAskingPrice <= 0)
    ) {
      setErrorMessage(
        "Asking price must be greater than 0."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage(
          "You must be logged in to list an asset."
        );
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("leverage_assets")
        .insert({
          owner_id: user.id,
          title: cleanTitle,
          description: cleanDescription,
          asset_category: assetCategory,
          country: cleanCountry,
          state_region:
            cleanStateRegion || null,
          city: cleanCity || null,
          address: cleanAddress || null,
          asking_price: numericAskingPrice,
          currency,
          status: "pending_verification",
          verification_status: "pending",
        });

      if (error) {
        console.error(error);
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      router.push("/leverage");
      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to list the asset."
      );

      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/leverage"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to HnC Leverage
          </Link>

          <p className="mt-6 text-sm font-bold uppercase tracking-wide text-blue-600">
            HnC LEVERAGE
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            List an Asset
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Present your asset or acquisition opportunity
            to verified buyers through the HnC transaction
            ecosystem.
          </p>
        </div>

        {/* NOTICE */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="font-bold text-blue-900">
            How listing works
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Your submission will enter HnC's verification
            process before it becomes publicly available
            as a verified opportunity. Listing an asset
            does not guarantee a buyer, financing or
            completion of a transaction.
          </p>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl bg-white p-8 shadow-sm"
        >

          {/* BASIC INFORMATION */}
          <section>
            <h2 className="text-xl font-bold">
              Asset Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Give potential buyers enough information
              to understand the opportunity.
            </p>

            <div className="mt-6 space-y-5">

              <div>
                <label className="mb-2 block font-semibold">
                  Asset Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Commercial Property in Lagos"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the asset, its condition, purpose, features and other relevant information."
                  rows={7}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Asset Category
                </label>

                <select
                  value={assetCategory}
                  onChange={(event) =>
                    setAssetCategory(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {assetCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </section>

          {/* LOCATION */}
          <section className="border-t pt-8">
            <h2 className="text-xl font-bold">
              Location
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Provide the location where the asset is
              physically situated, where applicable.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-semibold">
                  Country
                </label>

                <input
                  type="text"
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value)
                  }
                  placeholder="e.g. Nigeria"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  State / Region
                </label>

                <input
                  type="text"
                  value={stateRegion}
                  onChange={(event) =>
                    setStateRegion(event.target.value)
                  }
                  placeholder="e.g. Lagos"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  City
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                  placeholder="e.g. Ikeja"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Address
                </label>

                <input
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </section>

          {/* PRICE */}
          <section className="border-t pt-8">
            <h2 className="text-xl font-bold">
              Asking Price
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You can leave the price blank if the
              transaction is intended to be negotiated.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-semibold">
                  Asking Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={askingPrice}
                  onChange={(event) =>
                    setAskingPrice(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Currency
                </label>

                <select
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </section>

          {/* SUBMIT */}
          <section className="border-t pt-8">

            <div className="rounded-lg bg-gray-50 p-5">
              <p className="text-sm leading-6 text-gray-600">
                By submitting this listing, you confirm
                that you have the right to present the
                asset or opportunity and that the
                information provided is accurate to the
                best of your knowledge. HnC may request
                supporting documentation before approving
                the listing.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Submitting Asset..."
                  : "Submit Asset for Verification"}
              </button>

              <Link
                href="/leverage"
                className="rounded-lg border border-gray-300 px-6 py-4 text-center font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

            </div>
          </section>

        </form>
      </div>
    </main>
  );
}