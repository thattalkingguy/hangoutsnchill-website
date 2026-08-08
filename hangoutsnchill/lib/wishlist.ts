import { supabase } from "./supabase";

/**
 * Add a product to wishlist
 */
export async function addToWishlist(userId: string, productId: number) {
  const { data, error } = await supabase
    .from("wishlist")
    .insert({
      user_id: userId,
      product_id: productId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Remove product
 */
export async function removeFromWishlist(
  userId: string,
  productId: number
) {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
}

/**
 * Get wishlist products
 */
export async function getWishlist(userId: string) {
  // Step 1: Get wishlist rows
  const { data: wishlist, error: wishlistError } = await supabase
    .from("wishlist")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (wishlistError) throw wishlistError;

  if (!wishlist || wishlist.length === 0) {
    return [];
  }

  // Step 2: Extract product IDs
  const productIds = wishlist.map((item) => item.product_id);

  // Step 3: Fetch products
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productError) throw productError;

  // Step 4: Merge wishlist + products
  return wishlist.map((item) => ({
    ...item,
    product: products?.find(
      (p) => p.id === item.product_id
    ),
  }));
}

/**
 * Check if product is saved
 */
export async function isWishlisted(
  userId: string,
  productId: number
) {
  const { data, error } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}