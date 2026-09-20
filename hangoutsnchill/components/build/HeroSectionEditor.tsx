"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type HeroContent = {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
};

type HeroSectionEditorProps = {
  sectionId: string;
  initialTitle?: string | null;
  initialContent?: Record<string, unknown>;
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function HeroSectionEditor({
  sectionId,
  initialTitle,
  initialContent,
  onSaved,
  onCancel,
}: HeroSectionEditorProps) {
  const content = (initialContent || {}) as HeroContent;

  const [title, setTitle] = useState(initialTitle || "Welcome");
  const [headline, setHeadline] = useState(
    content.headline || "Welcome to my HnC website"
  );
  const [subheadline, setSubheadline] = useState(
    content.subheadline ||
      "Your identity, your story, your business — all in one place."
  );
  const [buttonText, setButtonText] = useState(
    content.buttonText || "Get Started"
  );
  const [buttonLink, setButtonLink] = useState(
    content.buttonLink || "#"
  );
  const [backgroundImage, setBackgroundImage] = useState(
    content.backgroundImage || ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const currentContent = (initialContent || {}) as HeroContent;

    setTitle(initialTitle || "Welcome");
    setHeadline(
      currentContent.headline || "Welcome to my HnC website"
    );
    setSubheadline(
      currentContent.subheadline ||
        "Your identity, your story, your business — all in one place."
    );
    setButtonText(currentContent.buttonText || "Get Started");
    setButtonLink(currentContent.buttonLink || "#");
    setBackgroundImage(currentContent.backgroundImage || "");
  }, [initialTitle, initialContent]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const cleanTitle = title.trim();
    const cleanHeadline = headline.trim();
    const cleanSubheadline = subheadline.trim();
    const cleanButtonText = buttonText.trim();
    const cleanButtonLink = buttonLink.trim();
    const cleanBackgroundImage = backgroundImage.trim();

    if (!cleanTitle) {
      setError("Please enter a section title.");
      setSaving(false);
      return;
    }

    if (!cleanHeadline) {
      setError("Please enter a headline.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to save this section.");
      setSaving(false);
      return;
    }

    const { data: section, error: sectionError } = await supabase
      .from("site_sections")
      .select("id, page_id")
      .eq("id", sectionId)
      .single();

    if (sectionError || !section) {
      console.error(sectionError);
      setError("We could not find this section.");
      setSaving(false);
      return;
    }

    const { data: page, error: pageError } = await supabase
      .from("site_pages")
      .select("id, site_id")
      .eq("id", section.page_id)
      .single();

    if (pageError || !page) {
      console.error(pageError);
      setError("We could not find the page for this section.");
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
      setError("You do not have permission to edit this section.");
      setSaving(false);
      return;
    }

    const updatedContent: HeroContent = {
      headline: cleanHeadline,
      subheadline: cleanSubheadline,
      buttonText: cleanButtonText,
      buttonLink: cleanButtonLink,
      backgroundImage: cleanBackgroundImage,
    };

    const { error: updateError } = await supabase
      .from("site_sections")
      .update({
        title: cleanTitle,
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sectionId);

    if (updateError) {
      console.error(updateError);
      setError(
        updateError.message || "We could not save this section."
      );
      setSaving(false);
      return;
    }

    setMessage("Hero section saved successfully.");
    setSaving(false);

    if (onSaved) {
      onSaved();
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          HnC Section Editor
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Edit Hero Section
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Customize the first section visitors see on your website.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Section Name
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Welcome"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Headline
          </label>

          <input
            type="text"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder="Welcome to my website"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Subheadline
          </label>

          <textarea
            value={subheadline}
            onChange={(event) => setSubheadline(event.target.value)}
            placeholder="Tell visitors what you do..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Button Text
          </label>

          <input
            type="text"
            value={buttonText}
            onChange={(event) => setButtonText(event.target.value)}
            placeholder="Get Started"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Button Link
          </label>

          <input
            type="text"
            value={buttonLink}
            onChange={(event) => setButtonLink(event.target.value)}
            placeholder="/contact"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
          />

          <p className="mt-2 text-xs text-slate-500">
            Example: /contact, /store, https://example.com
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Background Image URL
          </label>

          <input
            type="text"
            value={backgroundImage}
            onChange={(event) =>
              setBackgroundImage(event.target.value)
            }
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-white"
          />

          <p className="mt-2 text-xs text-slate-500">
            Image uploads will be connected to HnC storage later.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Hero Section"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Live Content Preview
        </p>

        <div
          className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-6"
          style={
            backgroundImage.trim()
              ? {
                  backgroundImage: `linear-gradient(rgba(2,6,23,0.72), rgba(2,6,23,0.72)), url(${backgroundImage.trim()})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <h3 className="text-2xl font-bold">
            {headline || "Your headline"}
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {subheadline || "Your subheadline"}
          </p>

          <div className="mt-5">
            <span className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              {buttonText || "Button"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}