"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/product";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [productType, setProductType] =
    useState<"digital" | "physical">("digital");
  const [deliveryType, setDeliveryType] =
    useState<"download" | "shipping">("download");
  const [weight, setWeight] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setErrorMessage("Invalid product ID.");
      setLoading(false);
      return;
    }

    loadProduct();
  }, [productId]);

  async function loadProduct() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("You must be logged in to edit a product.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("seller_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setErrorMessage(
        "Product not found or you are not authorized to edit it."
      );
      setLoading(false);
      return;
    }

    const currentProduct = data as Product;

    setProduct(currentProduct);

    setTitle(currentProduct.title);
    setDescription(currentProduct.description);
    setPrice(String(currentProduct.price));
    setCategory(currentProduct.category);
    setImageUrl(currentProduct.image_url ?? "");
    setStock(String(currentProduct.stock));
    setCurrency(currentProduct.currency);
    setProductType(currentProduct.product_type);
    setDeliveryType(currentProduct.delivery_type);
    setWeight(
      currentProduct.weight !== null
        ? String(currentProduct.weight)
        : ""
    );

    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
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
      !Number.isFinite(numericStock) ||
      numericStock < 0 ||
      !Number.isInteger(numericStock)
    ) {
      setErrorMessage("Stock must be a whole number of 0 or more.");
      return;
    }

    if (
      numericWeight !== null &&
      (!Number.isFinite(numericWeight) || numericWeight < 0)
    ) {
      setErrorMessage("Weight must be 0 or greater.");
      return;
    }

    if (!product) {
      setErrorMessage("Product information is missing.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Your session has expired. Please log in again.");
      setSaving(false);
      return;
    }

    /*
     * IMPORTANT:
     * We use UPDATE, not INSERT.
     *
     * We also filter by both:
     * - product ID
     * - seller ID
     *
     * This prevents a seller from updating another seller's product
     * through this page.
     */
    const { error } = await supabase
      .from("products")
      .update({
        title: cleanTitle,
        description: cleanDescription,
        price: numericPrice,
        category: cleanCategory,
        image_url: imageUrl.trim() || null,
        stock: numericStock,
        currency,
        product_type: productType,
        delivery_type: deliveryType,
        weight: numericWeight,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id)
      .eq("seller_id", user.id);

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Product updated successfully.");

    setSaving(false);

    setTimeout(() => {
      router.push("/marketplace/my-products");
      router.refresh();
    }, 700);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </main>
    );
  }

  if (errorMessage && !product) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Unable to load product
          </h1>

          <p className="mt-3 text-gray-600">
            {errorMessage}
          </p>

          <Link
            href="/marketplace/my-products"
            className="mt-6 inline-block rounded-lg bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900"
          >
            Back to My Products
          </Link>
        </div>
      </main>
    );
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
            Edit Product
          </h1>

          <p className="mt-2 text-gray-500">
            Update your product information.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
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
              onChange={(event) => setTitle(event.target.value)}
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
                onChange={(event) => setPrice(event.target.value)}
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
                onChange={(event) => setStock(event.target.value)}
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

            {imageUrl && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-500">
                  Current image
                </p>

                <img
                  src={imageUrl}
                  alt={title || "Product image"}
                  className="h-48 w-full rounded-lg object-cover"
                />
              </div>
            )}
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
                    event.target.value as "digital" | "physical"
                  )
                }
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
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
                <option value="download">Download</option>
                <option value="shipping">Shipping</option>
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
              onChange={(event) => setWeight(event.target.value)}
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
              {saving ? "Saving Changes..." : "Save Changes"}
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