"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id;

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [productType, setProductType] = useState("digital");
  const [deliveryType, setDeliveryType] = useState("download");
  const [currency, setCurrency] = useState("NGN");
  const [stock, setStock] = useState("1");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    if (!id) return;
    loadProduct();
  }, [id]);

  async function loadProduct() {
    if (!id || id === "undefined" || id === "null") {
      router.push("/marketplace/my-products");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const message = error?.message ?? "Unable to load product.";
      setFetchError(message);
      setLoading(false);
      return;
    }

    setTitle(data.title ?? "");
    setDescription(data.description ?? "");
    setPrice(String(data.price ?? ""));
    setCategory(data.category ?? "");
    setImageUrl(data.image_url ?? "");

    setProductType(data.product_type ?? "digital");
    setDeliveryType(data.delivery_type ?? "download");
    setCurrency(data.currency ?? "NGN");
    setStock(String(data.stock ?? 1));
    setWeight(data.weight ? String(data.weight) : "");

    setLoading(false);
  }

  async function updateProduct() {
    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({
        title,
        description,
        price: Number(price),
        category,
        image_url: imageUrl || null,
        product_type: productType,
        delivery_type: deliveryType,
        currency,
        stock: Number(stock),
        weight: weight ? Number(weight) : null,
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("✅ Product updated!");

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading product...
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="p-10">
        <div className="rounded-xl bg-white p-8 shadow">
          <h2 className="text-2xl font-bold text-red-600">
            Could not load product
          </h2>
          <p className="mt-4 text-gray-600">{fetchError}</p>
          <button
            onClick={() => router.push("/marketplace/my-products")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Back to My Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-10">

      <h1 className="mb-8 text-4xl font-bold">
        Edit Product
      </h1>

      <div className="space-y-5">

        <input
          className="w-full rounded border p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          rows={5}
          className="w-full rounded border p-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded border p-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className="w-full rounded border p-3"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <select
          className="w-full rounded border p-3"
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
        >
          <option value="digital">Digital</option>
          <option value="physical">Physical</option>
        </select>

        <select
          className="w-full rounded border p-3"
          value={deliveryType}
          onChange={(e) => setDeliveryType(e.target.value)}
        >
          <option value="download">Download</option>
          <option value="shipping">Shipping</option>
        </select>

        <select
          className="w-full rounded border p-3"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="NGN">NGN</option>
          <option value="USD">USD</option>
        </select>

        <input
          type="number"
          className="w-full rounded border p-3"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded border p-3"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <button
          onClick={updateProduct}
          disabled={saving}
          className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </main>
  );
}