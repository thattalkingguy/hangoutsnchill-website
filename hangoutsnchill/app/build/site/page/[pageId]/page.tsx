"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HeroSectionEditor from "@/components/build/HeroSectionEditor";

type SitePage = {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  description: string | null;
  page_type: string;
  status: string;
  sort_order: number;
};

type SiteSection = {
  id: string;
  page_id: string;
  section_type: string;
  title: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  status: string;
};

const PAGE_TYPES = [
  { value: "home", label: "Home" },
  { value: "about", label: "About" },
  { value: "services", label: "Services" },
  { value: "store", label: "Store" },
  { value: "booking", label: "Booking" },
  { value: "contact", label: "Contact" },
  { value: "blog", label: "Blog" },
  { value: "community", label: "Community" },
  { value: "custom", label: "Custom" },
];

const SECTION_TYPES = [
  {
    value: "hero",
    label: "Hero",
    description: "A strong opening section with a headline and call to action.",
  },
  {
    value: "text",
    label: "Text",
    description: "A flexible text and content section.",
  },
  {
    value: "about",
    label: "About",
    description: "Introduce the person, brand, company or organization.",
  },
  {
    value: "services",
    label: "Services",
    description: "Showcase services or what you offer.",
  },
  {
    value: "products",
    label: "Products",
    description: "Display products from the HnC Marketplace.",
  },
  {
    value: "booking",
    label: "Booking",
    description: "Let visitors request a booking or appointment.",
  },
  {
    value: "video",
    label: "Video",
    description: "Feature a video on your website.",
  },
  {
    value: "music",
    label: "Music",
    description: "Showcase songs, albums or music platforms.",
  },
  {
    value: "gallery",
    label: "Gallery",
    description: "Display photos and visual content.",
  },
  {
    value: "button",
    label: "Button / CTA",
    description: "Add a prominent action button.",
  },
  {
    value: "contact",
    label: "Contact",
    description: "Give visitors ways to contact you.",
  },
  {
    value: "form",
    label: "Form",
    description: "Collect information from visitors.",
  },
  {
    value: "testimonials",
    label: "Testimonials",
    description: "Display customer or community feedback.",
  },
  {
    value: "social",
    label: "Social Links",
    description: "Connect your social media profiles.",
  },
  {
    value: "custom",
    label: "Custom",
    description: "A flexible section for future HnC features.",
  },
];

function getSectionDescription(type: string) {
  return (
    SECTION_TYPES.find((section) => section.value === type)?.description ||
    "HnC website section."
  );
}

function getSectionLabel(type: string) {
  return (
    SECTION_TYPES.find((section) => section.value === type)?.label || type
  );
}

export default function HnCPageEditor() {
  const params = useParams();
  const router = useRouter();

  const pageId = Array.isArray(params?.pageId)
    ? params.pageId[0]
    : params?.pageId;

  const [page, setPage] = useState<SitePage | null>(null);
  const [sections, setSections] = useState<SiteSection[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(
    null
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(
    null
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [pageType, setPageType] = useState("custom");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    async function loadPage() {
      if (!pageId) {
        setError("Page ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: pageData, error: pageError } = await supabase
        .from("site_pages")
        .select(
          "id, site_id, slug, title, description, page_type, status, sort_order"
        )
        .eq("id", pageId)
        .single();

      if (pageError || !pageData) {
        console.error(pageError);
        setError("We could not find this page.");
        setLoading(false);
        return;
      }

      const { data: site, error: siteError } = await supabase
        .from("site_profiles")
        .select("id")
        .eq("id", pageData.site_id)
        .eq("owner_id", user.id)
        .single();

      if (siteError || !site) {
        console.error(siteError);
        setError("You do not have permission to edit this page.");
        setLoading(false);
        return;
      }

      const { data: sectionData, error: sectionError } = await supabase
        .from("site_sections")
        .select(
          "id, page_id, section_type, title, content, sort_order, status"
        )
        .eq("page_id", pageData.id)
        .order("sort_order", { ascending: true });

      if (sectionError) {
        console.error(sectionError);
        setError("The page loaded, but its sections could not be loaded.");
      }

      setPage(pageData);
      setTitle(pageData.title || "");
      setSlug(pageData.slug || "");
      setDescription(pageData.description || "");
      setPageType(pageData.page_type || "custom");
      setStatus(pageData.status || "draft");
      setSections(sectionData || []);

      setLoading(false);
    }

    loadPage();
  }, [pageId, router]);

  function normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!page) return;

    setSaving(true);
    setMessage("");
    setError("");

    const cleanTitle = title.trim();
    const cleanSlug = normalizeSlug(slug);

    if (!cleanTitle) {
      setError("Please enter a page title.");
      setSaving(false);
      return;
    }

    if (!cleanSlug) {
      setError("Please enter a valid page slug.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to save this page.");
      setSaving(false);
      return;
    }

    const { data: site, error: siteError } = await supabase
      .from("site_profiles")
      .select("id")
      .eq("id", page.site_id)
      .eq("owner_id", user.id)
      .single();

    if (siteError || !site) {
      console.error(siteError);
      setError("You do not have permission to edit this page.");
      setSaving(false);
      return;
    }

    const { data: updatedPage, error: updateError } = await supabase
      .from("site_pages")
      .update({
        title: cleanTitle,
        slug: cleanSlug,
        description: description.trim() || null,
        page_type: pageType,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id)
      .select(
        "id, site_id, slug, title, description, page_type, status, sort_order"
      )
      .single();

    if (updateError || !updatedPage) {
      console.error(updateError);
      setError(
        updateError?.message ||
          "Something went wrong while saving this page."
      );
      setSaving(false);
      return;
    }

    setPage(updatedPage);
    setTitle(updatedPage.title);
    setSlug(updatedPage.slug);
    setDescription(updatedPage.description || "");
    setPageType(updatedPage.page_type);
    setStatus(updatedPage.status);

    setMessage("Page saved successfully.");
    setSaving(false);
  }

  async function handleAddSection(sectionType: string) {
    if (!page) return;

    setAddingSection(true);
    setMessage("");
    setError("");

    const nextSortOrder =
      sections.length > 0
        ? Math.max(...sections.map((section) => section.sort_order)) + 1
        : 0;

    const defaultTitles: Record<string, string> = {
      hero: "Welcome",
      text: "Your Story",
      about: "About",
      services: "Our Services",
      products: "Products",
      booking: "Book With Us",
      video: "Featured Video",
      music: "Music",
      gallery: "Gallery",
      button: "Take Action",
      contact: "Contact",
      form: "Get in Touch",
      testimonials: "What People Say",
      social: "Connect With Us",
      custom: "New Section",
    };

    const { data, error: insertError } = await supabase
      .from("site_sections")
      .insert({
        page_id: page.id,
        section_type: sectionType,
        title: defaultTitles[sectionType] || "New Section",
        content: {},
        sort_order: nextSortOrder,
        status: "draft",
      })
      .select(
        "id, page_id, section_type, title, content, sort_order, status"
      )
      .single();

    if (insertError || !data) {
      console.error(insertError);
      setError(
        insertError?.message || "We could not add this section."
      );
      setAddingSection(false);
      return;
    }

    setSections((current) => [...current, data]);
    setMessage(`${getSectionLabel(sectionType)} section added.`);
    setAddingSection(false);

    if (sectionType === "hero") {
      setEditingSectionId(data.id);

      window.setTimeout(() => {
        document
          .getElementById(`section-${data.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }

  async function handleDeleteSection(sectionId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this section?"
    );

    if (!confirmed) return;

    setDeletingSectionId(sectionId);
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("site_sections")
      .delete()
      .eq("id", sectionId);

    if (deleteError) {
      console.error(deleteError);
      setError(deleteError.message || "We could not delete this section.");
      setDeletingSectionId(null);
      return;
    }

    setSections((current) =>
      current.filter((section) => section.id !== sectionId)
    );

    if (editingSectionId === sectionId) {
      setEditingSectionId(null);
    }

    setMessage("Section deleted.");
    setDeletingSectionId(null);
  }

  function handleSectionSaved() {
    setMessage("Hero section saved successfully.");
    setEditingSectionId(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-300">Loading page editor...</p>
        </div>
      </main>
    );
  }

  if (error && !page) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => router.push("/build/site")}
            className="mb-8 text-sm text-slate-300 transition hover:text-white"
          >
            ← Back to My Website
          </button>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h1 className="text-xl font-semibold">Page unavailable</h1>
            <p className="mt-2 text-sm text-red-200">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/build/site")}
            className="mb-4 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to My Website
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                HnC SITE
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Edit Page
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Build this page with HnC sections and connected tools.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Current Page
              </p>

              <p className="mt-1 font-medium">{page.title}</p>

              <p className="mt-1 text-xs text-slate-500">
                /{page.slug}
              </p>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* PAGE INFORMATION */}
        <form
          onSubmit={handleSave}
          className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6"
        >
          <div className="mb-8">
            <h2 className="text-xl font-semibold">Page Information</h2>

            <p className="mt-1 text-sm text-slate-400">
              Configure the basic identity of this page.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Page Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Home"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Page Slug
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950">
                <span className="border-r border-slate-800 px-4 py-3 text-sm text-slate-500">
                  /
                </span>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(normalizeSlug(event.target.value))
                  }
                  placeholder="home"
                  className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Example: /about or /services
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell visitors what this page is about..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Page Type
              </label>

              <select
                value={pageType}
                onChange={(event) => setPageType(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-white"
              >
                {PAGE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Page Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Page"}
          </button>
        </form>

        {/* PAGE SECTIONS */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                HnC BUILD
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Page Sections
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Build your website by adding sections below.
              </p>
            </div>

            <div className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-slate-400">
              {sections.length}{" "}
              {sections.length === 1 ? "section" : "sections"}
            </div>
          </div>

          {/* ADD SECTION — VERY VISIBLE */}
          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950 p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold">Add a Section</h3>

              <p className="mt-1 text-sm text-slate-400">
                Choose what you want to add to your page.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SECTION_TYPES.map((section) => (
                <button
                  key={section.value}
                  type="button"
                  onClick={() => handleAddSection(section.value)}
                  disabled={addingSection}
                  className={`rounded-xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    section.value === "hero"
                      ? "border-white bg-white text-slate-950 hover:bg-slate-200"
                      : "border-slate-800 bg-slate-900 text-white hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      {section.value === "hero" ? "★ " : "+ "}
                      {section.label}
                    </span>

                    {section.value === "hero" && (
                      <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Start Here
                      </span>
                    )}
                  </div>

                  <div
                    className={`mt-2 text-xs leading-5 ${
                      section.value === "hero"
                        ? "text-slate-600"
                        : "text-slate-500"
                    }`}
                  >
                    {section.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* EXISTING SECTIONS */}
          <div className="mt-8">
            {sections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
                <div className="text-3xl">＋</div>

                <p className="mt-3 font-medium">
                  Your page is empty.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Start with the{" "}
                  <span className="font-semibold text-white">
                    Hero
                  </span>{" "}
                  section above.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    Your Sections
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Edit or remove sections you've added.
                  </p>
                </div>

                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                    >
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-300">
                              {index + 1}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {section.title ||
                                  getSectionLabel(section.section_type)}
                              </p>

                              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                                {getSectionLabel(section.section_type)}
                              </p>

                              <p className="mt-2 text-sm text-slate-500">
                                {getSectionDescription(
                                  section.section_type
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {section.section_type === "hero" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMessage("");
                                  setError("");
                                  setEditingSectionId(
                                    editingSectionId === section.id
                                      ? null
                                      : section.id
                                  );
                                }}
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                              >
                                {editingSectionId === section.id
                                  ? "Close Editor"
                                  : "Edit Hero"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSection(section.id)
                              }
                              disabled={
                                deletingSectionId === section.id
                              }
                              className="rounded-lg border border-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                            >
                              {deletingSectionId === section.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {editingSectionId === section.id &&
                        section.section_type === "hero" && (
                          <div className="mt-4">
                            <HeroSectionEditor
                              sectionId={section.id}
                              initialTitle={section.title}
                              initialContent={section.content}
                              onSaved={handleSectionSaved}
                              onCancel={() =>
                                setEditingSectionId(null)
                              }
                            />
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* COMING NEXT */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Coming Next
          </p>

          <h2 className="mt-3 text-lg font-semibold">
            HnC AI Website Builder
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Soon, instead of manually choosing sections, users will
            be able to describe the website they want and HnC AI will
            create the page structure automatically.
          </p>
        </section>
      </div>
    </main>
  );
}