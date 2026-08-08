"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DeleteProductButtonProps = {
  productId: string;
  imageUrl?: string | null;
};

export default function DeleteProductButton({
  productId,
  imageUrl,
}: DeleteProductButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    // Delete product from database
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert(error.message);
      return;
    }

    // Optional: Delete image from Storage
    if (
      imageUrl &&
      imageUrl.includes("/storage/v1/object/public/product-images/")
    ) {
      const path = imageUrl.split("/product-images/")[1];

      if (path) {
        await supabase.storage
          .from("product-images")
          .remove([path]);
      }
    }

    alert("✅ Product deleted successfully.");

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Delete
    </button>
  );
}