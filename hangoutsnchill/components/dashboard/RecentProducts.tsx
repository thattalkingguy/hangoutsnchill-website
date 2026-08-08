"use client";

import Link from "next/link";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

import type { Product } from "@/lib/product";

type RecentProductsProps = {
  products: Product[];
};

export default function RecentProducts({
  products,
}: RecentProductsProps) {
  return (
    <Card
      title="Recent Products"
      subtitle="Your latest marketplace listings"
      footer={
        <Link href="/marketplace/add-product">
          <Button>
            + Add Product
          </Button>
        </Link>
      }
    >
      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Start selling by creating your first product."
          buttonText="Add Product"
          buttonHref="/marketplace/add-product"
        />
      ) : (
        <div className="space-y-5">

          {products.map((product) => (

            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
            >

              <div className="flex items-center gap-4">

                <img
                  src={
                    product.image_url ??
                    "https://placehold.co/100x100?text=No+Image"
                  }
                  alt={product.title}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    {product.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {product.category}
                  </p>

                  <p className="mt-1 font-semibold text-blue-600">
                    ₦{product.price}
                  </p>

                  <div className="mt-3">

                    <Badge
                      variant={
                        product.status === "published"
                          ? "success"
                          : "warning"
                      }
                    >
                      {product.status}
                    </Badge>

                  </div>

                </div>

              </div>

              <div className="flex gap-3">

                {product.id && (
                  <Link
                    href={`/marketplace/edit/${product.id}`}
                  >
                    <Button>
                      Edit
                    </Button>
                  </Link>
                )}

                <Button variant="danger">
                  Delete
                </Button>

              </div>

            </div>

          ))}

        </div>
      )}
    </Card>
  );
}