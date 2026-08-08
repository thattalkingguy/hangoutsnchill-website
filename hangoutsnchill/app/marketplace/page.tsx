"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/product";

import ProductCard from "@/components/marketplace/ProductCard";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";

type CartItem = {
  id: number;
  title: string;
  price: number;
  image_url?: string | null;
  quantity: number;
  seller_id: string;
  currency: string;
};

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  function addToCart(product: Product) {
    const existing = localStorage.getItem("hnc_cart");

    let cart: CartItem[] = existing ? JSON.parse(existing) : [];

    const index = cart.findIndex((item) => item.id === product.id);

    if (index >= 0) {
      cart[index].quantity++;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        image_url: product.image_url,
        price: Number(product.price),
        quantity: 1,
        seller_id: product.seller_id,
        currency: product.currency,
      });
    }

    localStorage.setItem("hnc_cart", JSON.stringify(cart));

    alert("🛒 Added to cart");
  }

  if (loading) {
    return <Loader text="Loading Marketplace..." />;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Marketplace
          </h1>

          <p className="text-gray-500">
            Buy and sell digital products.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/cart">
            <Button variant="success">
              Cart
            </Button>
          </Link>

          <Link href="/marketplace/add-product">
            <Button>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Marketplace Empty"
          description="There are no products available yet."
          buttonText="Add Product"
          buttonHref="/marketplace/add-product"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </main>
  );
}