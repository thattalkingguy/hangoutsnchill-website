"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SiteProfile = {
  id: string;
  owner_id: string;
  handle: string;
  display_name: string;
  site_name: string | null;
  tagline: string | null;
  description: string | null;
  site_type: string;
  status: string;
};

type SitePage = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  page_type: string;
  status: string;
  sort_order: number;
};

const QUICK_PAGES = [
  {
    slug: "about",
    title: "About",
    type: "about",
  },
  {
    slug: "services",
    title: "Services",
    type: "services",
  },
  {
    slug: "contact",
    title: "Contact",
    type: "contact",
  },
  {
    slug: "store",
    title: "Store",
    type: "store",
  },
];

export default function BuildSitePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [pages, setPages] = useState<SitePage[]>([]);

  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadWebsite() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login?next=/build/site");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("site_profiles")
          .select(
            "id, owner_id, handle, display_name, site_name, tagline, description, site_type, status"
          )
          .eq("owner_id", user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (!data) {
          router.push("/build/identity");
          return;
        }

        if (!mounted) {
          return;
        }

        setProfile(data);
        setSiteName(data.site_name || data.display_name || "");
        setTagline(data.tagline || "");
        setDescription(data.description || "");

        const { data: existingPages, error: pagesError } = await supabase
          .from("site_pages")
          .select(
            "id, slug, title, description, page_type, status, sort_order"
          )
          .eq("site_id", data.id)
          .order("sort_order", { ascending: true });

        if (pagesError) {
          throw new Error(pagesError.message);
        }

        let loadedPages = existingPages ?? [];

        const hasHomePage = loadedPages.some(
          (page) => page.slug === "home"
        );

        if (!hasHomePage) {
          const { data: newHomePage, error: homeError } = await supabase
            .from("site_pages")
            .insert({
              site_id: data.id,
              slug: "home",
              title: data.site_name || data.display_name || "Home",
              description:
                data.description || "Welcome to my HnC website.",
              page_type: "home",
              status: "draft",
              sort_order: 0,
            })
            .select(
              "id, slug, title, description, page_type, status, sort_order"
            )
            .single();

          if (homeError) {
            throw new Error(homeError.message);
          }

          loadedPages = [newHomePage, ...loadedPages];
        }

        if (mounted) {
          setPages(
            [...loadedPages].sort(
              (a, b) => a.sort_order - b.sort_order
            )
          );

          setLoading(false);
        }
      } catch (err) {
        console.error("HnC SITE loading error:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your HnC website."
          );

          setLoading(false);
        }
      }
    }

    void loadWebsite();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function saveWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setError("");
    setSuccess("");

    const cleanSiteName = siteName.trim();
    const cleanTagline = tagline.trim();
    const cleanDescription = description.trim();

    if (!cleanSiteName) {
      setError("Please enter a website name.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from("site_profiles")
        .update({
          site_name: cleanSiteName,
          tagline: cleanTagline || null,
          description: cleanDescription || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .eq("owner_id", profile.owner_id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setProfile({
        ...profile,
        site_name: cleanSiteName,
        tagline: cleanTagline || null,
        description: cleanDescription || null,
      });

      setSuccess("Your website information has been saved.");

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your website."
      );
    } finally {
      setSaving(false);
    }
  }

  async function createPage(
    slug: string,
    title: string,
    pageType: string
  ) {
    if (!profile) {
      return;
    }

    setError("");
    setSuccess("");
    setCreatingPage(true);

    try {
      const existingPage = pages.find(
        (page) => page.slug === slug
      );

      if (existingPage) {
        setError(`The ${title} page already exists.`);
        return;
      }

      const nextSortOrder =
        pages.length > 0
          ? Math.max(...pages.map((page) => page.sort_order)) + 1
          : 0;

      const { data, error: pageError } = await supabase
        .from("site_pages")
        .insert({
          site_id: profile.id,
          slug,
          title,
          description: `${title} page for ${
            profile.site_name || profile.display_name
          }.`,
          page_type: pageType,
          status: "draft",
          sort_order: nextSortOrder,
        })
        .select(
          "id, slug, title, description, page_type, status, sort_order"
        )
        .single();

      if (pageError) {
        throw new Error(pageError.message);
      }

      setPages((currentPages) =>
        [...currentPages, data].sort(
          (a, b) => a.sort_order - b.sort_order
        )
      );

      setSuccess(`${title} page created.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the page."
      );
    } finally {
      setCreatingPage(false);
    }
  }

  function openPage(pageId: string) {
    router.push(`/build/site/page/${pageId}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1E3] px-6 text-[#17130F]">
        <div className="rounded-2xl border border-[#B8954A]/20 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#62574B]">
            Building your HnC website workspace...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1E3] px-6 text-[#17130F]">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-black">
            HnC identity not found
          </h1>

          <p className="mt-3 text-sm text-red-700">
            Create your HnC identity before building your website.
          </p>

          <Link
            href="/build/identity"
            className="mt-6 inline-flex rounded-xl bg-[#17130F] px-6 py-3 text-sm font-bold text-[#F7F1E3]"
          >
            Create HnC ID
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1E3] px-6 py-12 text-[#17130F]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/build"
          className="inline-flex rounded-xl border border-[#B8954A]/30 bg-white/70 px-4 py-2 text-sm font-bold text-[#62574B] transition hover:-translate-y-0.5"
        >
          ← Back to BUILD
        </Link>

        <div className="mt-10">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6A24]">
            HnC SITE
          </div>

          <h1 className="mt-4 text-4xl font-black sm:text-6xl">
            Build your website.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#62574B] sm:text-lg">
            Your HnC website is becoming a working digital home.
            Build pages, add tools and eventually let HnC AI help
            create and manage the entire experience.
          </p>
        </div>

        <div className="mt-10 rounded-3xl bg-[#17130F] p-7 text-[#F7F1E3] shadow-xl sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8B45A]">
            Your HnC identity
          </div>

          <div className="mt-4 text-3xl font-black">
            @{profile.handle}
          </div>

          <p className="mt-2 text-sm text-[#D8CEC0]">
            {profile.handle}.hangoutsnchill.com
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#D8B45A]/20 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-[#D8CEC0]">
                Type
              </div>

              <div className="mt-1 font-black capitalize">
                {profile.site_type}
              </div>
            </div>

            <div className="rounded-xl border border-[#D8B45A]/20 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-[#D8CEC0]">
                Pages
              </div>

              <div className="mt-1 font-black">
                {pages.length}
              </div>
            </div>

            <div className="rounded-xl border border-[#D8B45A]/20 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-[#D8CEC0]">
                Website status
              </div>

              <div className="mt-1 font-black capitalize">
                {profile.status}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={saveWebsite}
          className="mt-8 rounded-3xl border border-[#B8954A]/25 bg-white p-7 shadow-sm sm:p-10"
        >
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6A24]">
            Website foundation
          </div>

          <h2 className="mt-3 text-3xl font-black">
            Tell HnC what your website is about.
          </h2>

          <div className="mt-8">
            <label
              htmlFor="siteName"
              className="mb-2 block text-sm font-bold"
            >
              Website name
            </label>

            <input
              id="siteName"
              type="text"
              value={siteName}
              onChange={(event) => {
                setSiteName(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="e.g. Ola Olabode"
              className="w-full rounded-xl border border-[#B8954A]/30 bg-white px-4 py-4 outline-none transition focus:border-[#B8954A] focus:ring-2 focus:ring-[#B8954A]/20"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="tagline"
              className="mb-2 block text-sm font-bold"
            >
              Tagline
            </label>

            <input
              id="tagline"
              type="text"
              value={tagline}
              onChange={(event) => {
                setTagline(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="What should people remember about you?"
              className="w-full rounded-xl border border-[#B8954A]/30 bg-white px-4 py-4 outline-none transition focus:border-[#B8954A] focus:ring-2 focus:ring-[#B8954A]/20"
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold"
            >
              About your website
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="Tell people what you do, what you offer, or what your website is about."
              rows={6}
              className="w-full resize-y rounded-xl border border-[#B8954A]/30 bg-white px-4 py-4 outline-none transition focus:border-[#B8954A] focus:ring-2 focus:ring-[#B8954A]/20"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-8 w-full cursor-pointer rounded-xl bg-[#17130F] px-7 py-4 text-sm font-black text-[#F7F1E3] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2A241E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Website..." : "Save Website Information"}
          </button>
        </form>

        {/* WEBSITE PAGES */}
        <section className="mt-8 rounded-3xl border border-[#B8954A]/25 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6A24]">
                Website pages
              </div>

              <h2 className="mt-3 text-3xl font-black">
                Your HnC website structure
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#62574B]">
                HnC creates and manages your website pages here.
                Click any page below to open its page editor.
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F1E3] px-4 py-3 text-sm font-bold">
              {pages.length} page{pages.length === 1 ? "" : "s"}
            </div>
          </div>

          {/* CLICKABLE PAGE CARDS */}
          <div className="mt-8 space-y-3">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => openPage(page.id)}
                className="group flex w-full cursor-pointer flex-col justify-between gap-4 rounded-2xl border border-[#B8954A]/20 bg-[#F7F1E3]/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-[#B8954A] hover:bg-white hover:shadow-md sm:flex-row sm:items-center"
              >
                <div>
                  <div className="text-lg font-black group-hover:text-[#8A6A24]">
                    {page.title}
                  </div>

                  <div className="mt-1 text-xs text-[#766A5E]">
                    /{page.slug} • {page.page_type} • {page.status}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-[#B8954A]/25 bg-white px-3 py-1 text-xs font-bold">
                    {page.status}
                  </span>

                  <span className="rounded-lg bg-[#17130F] px-4 py-2 text-xs font-bold text-[#F7F1E3] transition group-hover:bg-[#2A241E]">
                    Edit Page →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* ADD PAGE */}
          <div className="mt-8 border-t border-[#B8954A]/20 pt-8">
            <div className="text-sm font-black">
              Add a page
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_PAGES.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  disabled={creatingPage}
                  onClick={() =>
                    void createPage(
                      page.slug,
                      page.title,
                      page.type
                    )
                  }
                  className="cursor-pointer rounded-xl border border-[#B8954A]/25 bg-white px-4 py-4 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:border-[#B8954A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  + {page.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-[#17130F] p-7 text-[#F7F1E3] shadow-xl sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8B45A]">
            Coming next
          </div>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            HnC AI will help build the rest.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#D8CEC0] sm:text-base">
            The next major layer is the HnC AI website builder.
            Instead of manually designing everything, a user will be
            able to describe what they want and HnC will turn that
            description into website pages, sections and connected
            tools.
          </p>
        </section>

        <div className="mt-12 border-t border-[#B8954A]/20 pt-8 text-center">
          <p className="text-xs text-[#8A7B6B]">
            HnC SITE • HangoutsNChill
          </p>
        </div>
      </div>
    </main>
  );
}