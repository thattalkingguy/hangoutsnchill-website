"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const siteTypes = [
  { value: "personal", label: "Personal" },
  { value: "creator", label: "Creator" },
  { value: "business", label: "Business" },
  { value: "professional", label: "Professional" },
  { value: "organization", label: "Organization" },
  { value: "community", label: "Community" },
];

export default function BuildIdentityPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [siteType, setSiteType] = useState("creator");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function cleanHandle(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/^@+/, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void createIdentity();
  }

  async function createIdentity() {
    setError("");
    setSuccess("");

    const cleanDisplayName = displayName.trim();
    const cleanHandleValue = cleanHandle(handle);

    if (!cleanDisplayName) {
      setError("Please enter your display name.");
      return;
    }

    if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(cleanHandleValue)) {
      setError(
        "Your handle must be 3–30 characters and use only letters, numbers and hyphens."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        router.push("/login?next=/build/identity");
        return;
      }

      const { data: existingProfile, error: existingError } = await supabase
        .from("site_profiles")
        .select("id, handle")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (existingProfile) {
        setError(
          `You already have an HnC identity: @${existingProfile.handle}`
        );
        return;
      }

      const { error: insertError } = await supabase
        .from("site_profiles")
        .insert({
          owner_id: user.id,
          handle: cleanHandleValue,
          display_name: cleanDisplayName,
          site_name: cleanDisplayName,
          site_type: siteType,
          status: "draft",
        });

      if (insertError) {
        if (
          insertError.code === "23505" ||
          insertError.message.toLowerCase().includes("duplicate")
        ) {
          setError(
            "That HnC handle is already taken. Please choose another handle."
          );
          return;
        }

        throw new Error(insertError.message);
      }

      setSuccess(
        `Success! Your HnC identity @${cleanHandleValue} has been created.`
      );

      window.setTimeout(() => {
        router.push("/build");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F1E3] px-6 py-12 text-[#17130F]">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/build"
          className="inline-flex cursor-pointer rounded-xl border border-[#B8954A]/30 bg-white/70 px-4 py-2 text-sm font-bold text-[#62574B] transition hover:-translate-y-0.5"
        >
          ← Back to BUILD
        </Link>

        <div className="mt-10 rounded-3xl border border-[#B8954A]/25 bg-white p-7 shadow-sm sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6A24]">
            HnC ID
          </div>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Create your HnC identity.
          </h1>

          <p className="mt-4 text-base leading-7 text-[#62574B]">
            This identity will become the foundation of your website and your
            presence throughout the HnC ecosystem.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6"
          >
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-bold"
              >
                Display name
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="e.g. Ola Olabode"
                autoComplete="name"
                className="w-full cursor-text rounded-xl border border-[#B8954A]/30 bg-white px-4 py-4 text-[#17130F] outline-none transition focus:border-[#B8954A] focus:ring-2 focus:ring-[#B8954A]/20"
              />
            </div>

            <div>
              <label
                htmlFor="handle"
                className="mb-2 block text-sm font-bold"
              >
                HnC handle
              </label>

              <div className="flex overflow-hidden rounded-xl border border-[#B8954A]/30 bg-white focus-within:border-[#B8954A] focus-within:ring-2 focus-within:ring-[#B8954A]/20">
                <span className="flex items-center px-4 text-lg font-black text-[#B8954A]">
                  @
                </span>

                <input
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(event) => {
                    setHandle(cleanHandle(event.target.value));
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="yourname"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full cursor-text bg-transparent py-4 pr-4 text-[#17130F] outline-none"
                />
              </div>

              <p className="mt-2 text-xs text-[#766A5E]">
                3–30 characters. Letters, numbers and hyphens only.
              </p>

              {handle && (
                <div className="mt-3 rounded-xl bg-[#F7F1E3] px-4 py-3 text-sm">
                  Your future HnC address:
                  <span className="ml-2 font-black">
                    {handle}.hangoutsnchill.com
                  </span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="siteType"
                className="mb-2 block text-sm font-bold"
              >
                What are you building?
              </label>

              <select
                id="siteType"
                value={siteType}
                onChange={(event) => {
                  setSiteType(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                className="w-full cursor-pointer rounded-xl border border-[#B8954A]/30 bg-white px-4 py-4 text-[#17130F] outline-none focus:border-[#B8954A] focus:ring-2 focus:ring-[#B8954A]/20"
              >
                {siteTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-[#17130F] px-7 py-4 text-sm font-black text-[#F7F1E3] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#2A241E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating HnC ID..." : "Create My HnC ID"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}