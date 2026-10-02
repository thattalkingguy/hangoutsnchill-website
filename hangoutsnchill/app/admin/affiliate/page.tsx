"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type AffiliatePartner = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  route: string;
  active: boolean;
  created_at: string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  partners?: AffiliatePartner[];
  partner?: AffiliatePartner;
  count?: number;
};

const EMPTY_FORM = {
  slug: "",
  name: "",
  category: "",
  description: "",
  route: "",
  active: false,
};

type FormState = typeof EMPTY_FORM;

export default function AffiliateAdminPage() {
  const [partners, setPartners] = useState<
    AffiliatePartner[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  /*
   * Get the current Supabase browser session and
   * return its access token for the protected admin API.
   */
  const getAccessToken = useCallback(
    async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          "Unable to read the current HnC session."
        );
      }

      if (!session?.access_token) {
        throw new Error(
          "Your HnC admin session has expired. Please sign in again."
        );
      }

      return session.access_token;
    },
    []
  );

  /*
   * Common authenticated request helper.
   */
  const authenticatedFetch = useCallback(
    async (
      url: string,
      options: RequestInit = {}
    ) => {
      const accessToken =
        await getAccessToken();

      const headers = new Headers(
        options.headers
      );

      headers.set(
        "Authorization",
        `Bearer ${accessToken}`
      );

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [getAccessToken]
  );

  const loadPartners = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await authenticatedFetch(
          "/api/admin/affiliate/partners",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load affiliate partners."
        );
      }

      setPartners(data.partners || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load affiliate partners."
      );
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  function updateForm(
    field: keyof FormState,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEditing(
    partner: AffiliatePartner
  ) {
    setEditingId(partner.id);

    setForm({
      slug: partner.slug,
      name: partner.name,
      category: partner.category,
      description:
        partner.description || "",
      route: partner.route,
      active: partner.active,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
  }

  async function savePartner() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const method = editingId
        ? "PATCH"
        : "POST";

      const payload = editingId
        ? {
            id: editingId,
            ...form,
          }
        : form;

      const response =
        await authenticatedFetch(
          "/api/admin/affiliate/partners",
          {
            method,
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save affiliate partner."
        );
      }

      setMessage(
        editingId
          ? "Affiliate partner updated successfully."
          : "Affiliate partner created successfully."
      );

      resetForm();

      await loadPartners();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save affiliate partner."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePartner(
    partner: AffiliatePartner
  ) {
    setMessage("");
    setError("");

    try {
      const response =
        await authenticatedFetch(
          "/api/admin/affiliate/partners",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: partner.id,
              active: !partner.active,
            }),
          }
        );

      const data: ApiResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update partner status."
        );
      }

      setMessage(
        `${partner.name} is now ${
          !partner.active
            ? "active"
            : "inactive"
        }.`
      );

      await loadPartners();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update partner status."
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* HEADER */}

      <section className="mb-6">
        <div className="rounded-3xl bg-gray-900 p-5 text-white shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                HnC Commerce Engine
              </p>

              <h1 className="text-2xl font-black sm:text-3xl">
                Affiliate Commerce
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                Manage HnC affiliate partners,
                activation status and commercial
                destinations from the admin command
                center.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-gray-400">
                Registered partners
              </p>

              <p className="text-2xl font-black">
                {partners.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATUS */}

      {message && (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      {/* PARTNER FORM */}

      <section className="mb-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {editingId
                ? "Edit partner"
                : "Add partner"}
            </p>

            <h2 className="mt-1 text-xl font-black text-gray-900">
              {editingId
                ? "Update Affiliate Partner"
                : "Register Affiliate Partner"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Slug
            </span>

            <input
              value={form.slug}
              onChange={(event) =>
                updateForm(
                  "slug",
                  event.target.value
                )
              }
              disabled={Boolean(editingId)}
              placeholder="example-partner"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900 disabled:bg-gray-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Partner name
            </span>

            <input
              value={form.name}
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
              placeholder="Partner name"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Category
            </span>

            <input
              value={form.category}
              onChange={(event) =>
                updateForm(
                  "category",
                  event.target.value
                )
              }
              placeholder="Affiliate Commerce"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              HnC route
            </span>

            <input
              value={form.route}
              onChange={(event) =>
                updateForm(
                  "route",
                  event.target.value
                )
              }
              placeholder="/iphone18"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-gray-700">
              Description
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm(
                  "description",
                  event.target.value
                )
              }
              rows={3}
              placeholder="Describe the partner opportunity."
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 md:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                updateForm(
                  "active",
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />

            <span>
              <span className="block text-sm font-bold text-gray-900">
                Activate partner
              </span>

              <span className="block text-xs text-gray-500">
                Active partners can participate in
                HnC's affiliate ecosystem.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={savePartner}
            disabled={saving}
            className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Save Changes"
                : "Add Partner"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel Editing
            </button>
          )}
        </div>
      </section>

      {/* PARTNER LIST */}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Partner registry
            </p>

            <h2 className="text-xl font-black text-gray-900">
              HnC Affiliate Partners
            </h2>
          </div>

          <button
            type="button"
            onClick={loadPartners}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Loading affiliate partners...
          </div>
        ) : partners.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-gray-900">
              No affiliate partners registered yet.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Add your first partner above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {partners.map((partner) => (
              <article
                key={partner.id}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-gray-900">
                        {partner.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                          partner.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {partner.active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-bold text-gray-400">
                      {partner.slug}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600">
                    {partner.category}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {partner.description ||
                    "No description supplied."}
                </p>

                <div className="mt-4 rounded-2xl bg-gray-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    HnC route
                  </p>

                  <p className="mt-1 break-all text-sm font-bold text-gray-800">
                    {partner.route}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      startEditing(partner)
                    }
                    className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      togglePartner(partner)
                    }
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black ${
                      partner.active
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {partner.active
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}