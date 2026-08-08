"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/product";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";

function formatPrice(price: number, currency: string) {
  switch (currency) {
    case "USD":
      return `$${price}`;
    case "NGN":
    default:
      return `₦${price}`;
  }
}

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setProduct(data as Product);
    }

    setLoading(false);
  }

  function addToCart() {
    if (!product) return;

    const existingCart = JSON.parse(
      localStorage.getItem("hnc_cart") || "[]"
    );

    const existingItem = existingCart.find(
      (item: any) => item.id === product.id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        image_url: product.image_url,
        quantity: 1,
        seller_id: product.seller_id,
        currency: product.currency,
      });
    }

    localStorage.setItem(
      "hnc_cart",
      JSON.stringify(existingCart)
    );

    alert("✅ Added to cart!");
  }

  if (loading) {
    return <Loader text="Loading product..." />;
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-4xl p-10">
        <h1 className="text-3xl font-bold">
          Product not found
        </h1>

        <Link href="/marketplace">
          <Button className="mt-6">
            Back to Marketplace
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full rounded-2xl"
            />
          ) : (
            <div className="flex h-96 items-center justify-center rounded-2xl bg-gray-100">
              No Image
            </div>
          )}
        </div>

        <div>
          <Badge variant="info">
            {product.category}
          </Badge>

          <h1 className="mt-4 text-4xl font-bold">
            {product.title}
          </h1>

          <p className="mt-6 whitespace-pre-line text-gray-600">
            {product.description}
          </p>

          <h2 className="mt-8 text-4xl font-bold text-blue-600">
            {formatPrice(
              Number(product.price),
              product.currency
            )}
          </h2>

          <div className="mt-8 flex gap-4">
            <Button
              variant="success"
              onClick={addToCart}
            >
              Add to Cart
            </Button>

            <Button variant="secondary">
              ❤️ Wishlist
            </Button>
          </div>

          <Link href="/marketplace">
            <Button className="mt-8 w-full">
              ← Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}