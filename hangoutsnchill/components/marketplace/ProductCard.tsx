"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Product } from "@/lib/product";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

import {
  addToWishlist,
  removeFromWishlist,
  isWishlisted,
} from "@/lib/wishlist";

import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/context/WishlistContext";

type Props = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

function formatPrice(price: number, currency: string) {
  switch (currency) {
    case "USD":
      return `$${price}`;
    case "NGN":
    default:
      return `₦${price}`;
  }
}

export default function ProductCard({
  product,
  onAddToCart,
}: Props) {
  const [saved, setSaved] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const { refreshWishlist } = useWishlist();

  useEffect(() => {
    checkWishlist();
  }, []);

  async function checkWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const exists = await isWishlisted(user.id, Number(product.id));

    setSaved(exists);
  }

  async function toggleWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      setLoadingWishlist(true);

      if (saved) {
        await removeFromWishlist(user.id, Number(product.id));
        setSaved(false);
      } else {
        await addToWishlist(user.id, Number(product.id));
        setSaved(true);
      }

      // 🔥 Refresh global wishlist count
      await refreshWishlist();

    } catch (error) {
      console.error(error);
      alert("Unable to update wishlist.");
    }

    setLoadingWishlist(false);
  }

  return (
    <Card>
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          className="mb-5 h-56 w-full rounded-xl object-cover"
        />
      )}

      <h2 className="text-2xl font-bold">
        {product.title}
      </h2>

      <p className="mt-2 line-clamp-3 text-gray-500">
        {product.description}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <Badge variant="info">
          {product.category}
        </Badge>

        <span className="text-2xl font-bold text-blue-600">
          {formatPrice(
            Number(product.price),
            product.currency
          )}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="success"
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </Button>

        <Button
          variant={saved ? "danger" : "secondary"}
          onClick={toggleWishlist}
          disabled={loadingWishlist}
        >
          {loadingWishlist
            ? "..."
            : saved
            ? "❤️ Saved"
            : "🤍 Wishlist"}
        </Button>
      </div>

      <div className="mt-3">
        <Link href={`/marketplace/${product.id}`}>
          <Button className="w-full">
            View Product
          </Button>
        </Link>
      </div>
    </Card>
  );
}