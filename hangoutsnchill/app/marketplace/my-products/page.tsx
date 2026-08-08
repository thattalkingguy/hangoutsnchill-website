"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/product";

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  async function deleteProduct(id: number) {
    const confirmed = window.confirm(
      "Delete this product?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">
            My Products
          </h1>

          <Link
            href="/marketplace/add-product"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add Product
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow">
            Loading...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-bold">
              No products yet
            </h2>

            <p className="mt-3 text-gray-500">
              Publish your first product.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">

            <table className="w-full">

              <thead className="bg-gray-100">

                <tr>
                  <th className="p-4 text-left">
                    Product
                  </th>

                  <th className="p-4 text-left">
                    Price
                  </th>

                  <th className="p-4 text-left">
                    Stock
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr
                    key={product.id}
                    className="border-t"
                  >

                    <td className="p-4">
                      {product.title}
                    </td>

                    <td className="p-4">
                      {product.currency} {product.price}
                    </td>

                    <td className="p-4">
                      {product.stock}
                    </td>

                    <td className="p-4 capitalize">
                      {product.status}
                    </td>

                    <td className="space-x-2 p-4">

                      <Link
                        href={`/marketplace/${product.id}`}
                        className="rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700"
                      >
                        View
                      </Link>

                      <Link
                        href={`/marketplace/edit/${product.id}`}
                        className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          deleteProduct(product.id)
                        }
                        className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </main>
  );
}