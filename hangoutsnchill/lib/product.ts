export type Product = {
  id: number;

  title: string;
  description: string;

  price: number;

  category: string;

  image_url: string | null;

  product_type: "digital" | "physical";

  stock: number;

  seller_id: string;

  user_id: string;

  status: "draft" | "published" | "archived";

  currency: "NGN" | "USD" | string;

  delivery_type: "download" | "shipping";

  weight: number | null;

  created_at: string | null;

  updated_at: string | null;
};