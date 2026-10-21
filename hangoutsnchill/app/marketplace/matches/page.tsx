"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type BuyerRequest = {
  id: number | string;
  item_name: string;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  max_budget?: number | null;
  currency?: string | null;
  preferred_city?: string | null;
  preferred_state?: string | null;
  preferred_country?: string | null;
  status?: string | null;
  needed_by?: string | null;
};

type Product = {
  id: number | string;
  title: string;
  description?: string | null;
  category?: string | null;
  price: number;
  currency?: string | null;
  stock?: number | null;
  status?: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

type Match = {
  product: Product;
  score: number;
  reasons: string[];
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function matchProducts(request: BuyerRequest, products: Product[]): Match[] {
  const requestText = normalize(
    `${request.item_name} ${request.description || ""}`
  );
  const requestWords = new Set(requestText.split(" ").filter((word) => word.length > 2));

  return products
    .filter((product) => {
      if (product.status && product.status !== "published") return false;
      if (product.stock !== undefined && product.stock !== null && product.stock <= 0) return false;
      return true;
    })
    .map((product) => {
      const title = normalize(product.title || "");
      const details = normalize(`${product.description || ""} ${product.category || ""}`);
      const titleWords = new Set(title.split(" ").filter((word) => word.length > 2));
      const overlap = [...requestWords].filter((word) => titleWords.has(word) || details.includes(word)).length;
      let score = 0;
      const reasons: string[] = [];

      if (title === normalize(request.item_name)) {
        score += 60;
        reasons.push("Product title matches the requested item");
      } else if (title.includes(normalize(request.item_name)) || normalize(request.item_name).includes(title)) {
        score += 45;
        reasons.push("Product title closely matches the request");
      } else if (requestWords.size > 0 && overlap > 0) {
        score += Math.round((overlap / requestWords.size) * 50);
        reasons.push("Some requested words match the listing");
      }

      if (request.max_budget != null && request.max_budget > 0) {
        if (product.price <= request.max_budget) {
          score += 20;
          reasons.push("Price is within the stated budget");
        } else {
          score -= 10;
          reasons.push("Price exceeds the stated budget");
        }
      }

      if (request.quantity && product.stock != null) {
        if (product.stock >= request.quantity) {
          score += 10;
          reasons.push("Available stock meets the requested quantity");
        } else {
          score -= 15;
          reasons.push("Available stock may be insufficient");
        }
      }

      if (request.preferred_city && details.includes(normalize(request.preferred_city))) {
        score += 5;
        reasons.push("Location may match your preference");
      }

      return { product, score: Math.max(0, Math.min(100, score)), reasons };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

export default function MarketplaceMatchesPage() {
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setSignedIn(false);
        setRequests([]);
        setProducts([]);
        return;
      }

      setSignedIn(true);

      const [requestResult, productResult] = await Promise.all([
        supabase
          .from("hnc_buyer_requests")
          .select("*")
          .eq("buyer_id", authData.user.id)
          .in("status", ["open", "matched"])
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false }),
      ]);

      if (requestResult.error) throw requestResult.error;
      if (productResult.error) throw productResult.error;

      const requestRows = (requestResult.data || []) as BuyerRequest[];
      setRequests(requestRows);
      setProducts((productResult.data || []) as Product[]);

      setSelectedId((current) => {
        if (current && requestRows.some((request) => String(request.id) === current)) {
          return current;
        }
        return requestRows.length ? String(requestRows[0].id) : "";
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load marketplace matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedRequest = requests.find((request) => String(request.id) === selectedId);
  const matches = selectedRequest ? matchProducts(selectedRequest, products) : [];

  if (loading) {
    return <main className="mx-auto max-w-5xl p-6"><p>Loading your Matching Engine...</p></main>;
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-3 text-3xl font-bold">Marketplace Matching Engine</h1>
        <p className="mb-5">Sign in to find products that match your buyer requests.</p>
        <Link className="rounded bg-black px-5 py-3 text-white" href="/auth/login">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Matching Engine</h1>
          <p className="mt-2 text-gray-600">
            Find published products that may meet your buying needs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          className="rounded border px-4 py-2 hover:bg-gray-100"
        >
          Refresh matches
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Unable to load matches</p>
          <p className="mt-1 break-words">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">No active buyer requests</h2>
          <p className="my-3 text-gray-600">
            Create a buyer request first. The Matching Engine will compare it with published products.
          </p>
          <Link className="inline-block rounded bg-black px-5 py-3 text-white" href="/marketplace/request">
            Create a buyer request
          </Link>
        </section>
      ) : (
        <section className="space-y-5">
          <div className="rounded-xl border p-5">
            <label htmlFor="buyer-request" className="mb-2 block font-semibold">
              Choose a buyer request
            </label>
            <select
              id="buyer-request"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="w-full rounded-lg border p-3"
            >
              {requests.map((request) => (
                <option key={String(request.id)} value={String(request.id)}>
                  {request.item_name}
                </option>
              ))}
            </select>

            {selectedRequest && (
              <div className="mt-4 space-y-1 text-sm text-gray-700">
                {selectedRequest.description && <p>{selectedRequest.description}</p>}
                <p>
                  Budget:{" "}
                  {selectedRequest.max_budget == null
                    ? "Not specified"
                    : `${selectedRequest.currency || "NGN"} ${selectedRequest.max_budget.toLocaleString()}`}
                </p>
                {selectedRequest.quantity != null && (
                  <p>Quantity: {selectedRequest.quantity} {selectedRequest.unit || "units"}</p>
                )}
                <p>
                  Location: {[selectedRequest.preferred_city, selectedRequest.preferred_state, selectedRequest.preferred_country]
                    .filter(Boolean)
                    .join(", ") || "Not specified"}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Potential product matches</h2>
            <span className="text-sm text-gray-500">{matches.length} matches found</span>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border p-6">
              No published products are available to compare yet.
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-xl border p-6">
              No strong matches were found for this request. Try another request or check again when more products are published.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map(({ product, score, reasons }) => (
                <article key={String(product.id)} className="overflow-hidden rounded-xl border">
                  {product.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">{product.title}</h3>
                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                        {score}% match
                      </span>
                    </div>
                    <p className="font-semibold">
                      {product.currency || "NGN"} {Number(product.price).toLocaleString()}
                    </p>
                    {product.category && <p className="text-sm text-gray-500">{product.category}</p>}
                    {product.description && <p className="text-sm text-gray-700">{product.description}</p>}
                    {product.stock != null && (
                      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    )}
                    <div>
                      <p className="mb-1 text-sm font-semibold">Why it matched</p>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
                        {reasons.map((reason) => <li key={reason}>{reason}</li>)}
                      </ul>
                    </div>
                    <Link
                      className="inline-block rounded bg-black px-4 py-2 text-white"
                      href={`/marketplace/${product.id}`}
                    >
                      View product
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
