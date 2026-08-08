"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { getWishlist, removeFromWishlist } from "@/lib/wishlist";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getWishlist(user.id);
      
      console.log("Wishlist Data:", data);
      console.log("User ID:", user.id);

      setItems(data || []);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  async function remove(productId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await removeFromWishlist(user.id, productId);

    setItems((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }

  if (loading) {
    return <Loader text="Loading Wishlist..." />;
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <EmptyState
          title="Your Wishlist is Empty"
          description="Save products you love and they'll appear here."
          buttonText="Browse Marketplace"
          buttonHref="/"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">
          ❤️ My Wishlist
        </h1>

        <Link href="/">
          <Button>
            Marketplace
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const product = item.product;

          if (!product) return null;

          return (
            <div
              key={item.id}
              className="rounded-xl bg-white p-5 shadow"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="mb-4 h-56 w-full rounded-xl object-cover"
                />
              )}

              <h2 className="text-xl font-bold">
                {product.title}
              </h2>

              <p className="mt-2 text-gray-500 line-clamp-3">
                {product.description}
              </p>

              <p className="mt-4 text-2xl font-bold text-blue-600">
                {product.currency === "USD"
                  ? `$${product.price}`
                  : `₦${product.price}`}
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  href={`/marketplace/${product.id}`}
                  className="flex-1"
                >
                  <Button className="w-full">
                    View Product
                  </Button>
                </Link>

                <Button
                  variant="danger"
                  onClick={() => remove(product.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}