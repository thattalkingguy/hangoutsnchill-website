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
  const [productType, setProductType] =
    useState<"digital" | "physical">("digital");
  const [deliveryType, setDeliveryType] =
    useState<"download" | "shipping">("download");
  const [weight, setWeight] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    const numericWeight =
      weight.trim() === "" ? null : Number(weight);

    if (!cleanTitle) {
      setErrorMessage("Product title is required.");
      return;
    }

    if (!cleanDescription) {
      setErrorMessage("Product description is required.");
      return;
    }

    if (!cleanCategory) {
      setErrorMessage("Product category is required.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setErrorMessage("Price must be greater than 0.");
      return;
    }

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      setErrorMessage(
        "Stock must be a whole number of 0 or more."
      );
      return;
    }

    if (
      numericWeight !== null &&
      (!Number.isFinite(numericWeight) || numericWeight < 0)
    ) {
      setErrorMessage("Weight must be 0 or greater.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "You must be logged in to add a product."
      );
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("products")
      .insert({
        title: cleanTitle,
        description: cleanDescription,
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
      });

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    router.push("/marketplace/my-products");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <Link
            href="/marketplace/my-products"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to My Products
          </Link>

          <h1 className="mt-4 text-4xl font-bold">
            Add Product
          </h1>

          <p className="mt-2 text-gray-500">
            Sell your products on HangoutsNChill.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-8 shadow"
        >

          <div>
            <label className="mb-2 block font-semibold">
              Product Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter product title"
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="Describe your product"
              rows={6}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-semibold">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="0.00"
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
              </select>
            </div>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-semibold">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                placeholder="e.g. Education"
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Stock
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(event) =>
                setImageUrl(event.target.value)
              }
              placeholder="https://..."
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-semibold">
                Product Type
              </label>

              <select
                value={productType}
                onChange={(event) =>
                  setProductType(
                    event.target.value as
                      | "digital"
                      | "physical"
                  )
                }
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="digital">
                  Digital
                </option>

                <option value="physical">
                  Physical
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Delivery Type
              </label>

              <select
                value={deliveryType}
                onChange={(event) =>
                  setDeliveryType(
                    event.target.value as
                      | "download"
                      | "shipping"
                  )
                }
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="download">
                  Download
                </option>

                <option value="shipping">
                  Shipping
                </option>
              </select>
            </div>

          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Weight
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={weight}
              onChange={(event) =>
                setWeight(event.target.value)
              }
              placeholder="Optional"
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Product..."
                : "Save Product"}
            </button>

            <Link
              href="/marketplace/my-products"
              className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

          </div>

        </form>
      </div>
    </main>
  );
}