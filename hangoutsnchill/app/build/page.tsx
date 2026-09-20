"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SiteProfile = {
  id: string;
  handle: string;
  display_name: string;
  site_name: string | null;
  site_type: string;
  status: string;
};

export default function BuildPage() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("site_profiles")
          .select(
            "id, handle, display_name, site_name, site_type, status"
          )
          .eq("owner_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("HnC profile error:", error);
        }

        if (mounted) {
          setProfile(data ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("HnC BUILD error:", error);

        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F1E3] text-[#17130F]">
      <section className="relative overflow-hidden px-6 py-16 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(184,149,74,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(23,19,15,0.08),_transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex rounded-xl border border-[#B8954A]/30 bg-white/70 px-4 py-2 text-sm font-bold text-[#62574B] transition hover:-translate-y-0.5"
          >
            ← Back to HnC
          </Link>

          <div className="mt-12 max-w-3xl">
            <div className="inline-flex rounded-full border border-[#B8954A]/40 bg-white/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#8A6A24]">
              HnC BUILD
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-7xl">
              Build your world on HnC.
            </h1>

            <p className="mt-6 text-lg leading-8 text-[#62574B] sm:text-xl">
              Create your identity, launch your website and connect your
              business, creativity, community and opportunities inside the HnC
              ecosystem.
            </p>
          </div>

          {loading ? (
            <section className="mt-12 rounded-3xl border border-[#B8954A]/20 bg-white/80 p-8 shadow-sm">
              <p className="text-sm font-semibold text-[#62574B]">
                Loading your HnC identity...
              </p>
            </section>
          ) : profile ? (
            <section className="mt-12 rounded-3xl bg-[#17130F] p-8 text-[#F7F1E3] shadow-xl sm:p-10">
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8B45A]">
                Your HnC identity
              </div>

              <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h2 className="text-4xl font-black sm:text-5xl">
                    @{profile.handle}
                  </h2>

                  <p className="mt-3 text-lg font-semibold text-[#D8CEC0]">
                    {profile.display_name}
                  </p>

                  <p className="mt-4 text-sm text-[#D8CEC0]">
                    Your HnC website address
                  </p>

                  <div className="mt-2 break-all text-xl font-black text-[#D8B45A]">
                    {profile.handle}.hangoutsnchill.com
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#D8B45A]/30 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                      {profile.site_type}
                    </span>

                    <span className="rounded-full border border-[#D8B45A]/30 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                      {profile.status}
                    </span>
                  </div>
                </div>

                <Link
                  href="/build/site"
                  className="inline-flex items-center justify-center rounded-xl bg-[#D8B45A] px-7 py-4 text-sm font-black text-[#17130F] shadow-lg transition hover:-translate-y-0.5"
                >
                  Build My Website →
                </Link>
              </div>
            </section>
          ) : (
            <section className="mt-12 rounded-3xl bg-[#17130F] p-8 text-[#F7F1E3] shadow-xl sm:p-10">
              <div className="max-w-3xl">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#D8B45A]">
                  Start here
                </div>

                <h2 className="mt-4 text-3xl font-black sm:text-5xl">
                  Claim your HnC identity.
                </h2>

                <p className="mt-5 text-base leading-7 text-[#D8CEC0] sm:text-lg">
                  Create your HnC ID first. Your identity will become the
                  foundation for your website and your activities across HnC.
                </p>

                <Link
                  href="/build/identity"
                  className="mt-7 inline-flex rounded-xl bg-[#D8B45A] px-7 py-4 text-sm font-black text-[#17130F] shadow-lg transition hover:-translate-y-0.5"
                >
                  Create My HnC ID →
                </Link>
              </div>
            </section>
          )}

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create your HnC ID",
                text: "Choose your unique identity and handle on HnC.",
              },
              {
                number: "02",
                title: "Build your website",
                text: "Create a professional web presence without starting from scratch.",
              },
              {
                number: "03",
                title: "Add your tools",
                text: "Connect stores, bookings, forms, payments, content and more.",
              },
              {
                number: "04",
                title: "Use HnC AI",
                text: "Describe what you want and let HnC AI help build and manage it.",
              },
              {
                number: "05",
                title: "Grow your audience",
                text: "Connect with people, customers, creators and communities.",
              },
              {
                number: "06",
                title: "Earn on HnC",
                text: "Turn your skills, products, services and audience into opportunities.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-3xl border border-[#B8954A]/20 bg-white/80 p-7 shadow-sm"
              >
                <div className="text-sm font-black tracking-[0.2em] text-[#B8954A]">
                  {item.number}
                </div>

                <h2 className="mt-4 text-2xl font-black">
                  {item.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#62574B]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-16 rounded-3xl border border-[#B8954A]/30 bg-white/80 p-8 shadow-sm sm:p-10">
            <div className="max-w-3xl">
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#8A6A24]">
                The HnC vision
              </div>

              <h2 className="mt-4 text-3xl font-black sm:text-5xl">
                One identity. One website. One ecosystem.
              </h2>

              <p className="mt-5 text-base leading-7 text-[#62574B] sm:text-lg">
                HnC is being designed so that a person or business can build a
                digital presence and then connect the tools they need without
                leaving the ecosystem.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Website",
                  "Store",
                  "Bookings",
                  "Forms",
                  "Payments",
                  "Community",
                  "Academy",
                  "AI Tools",
                ].map((tool) => (
                  <div
                    key={tool}
                    className="rounded-xl border border-[#B8954A]/20 bg-white px-4 py-4 text-sm font-bold"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-12 border-t border-[#B8954A]/20 pt-8 text-center">
            <p className="text-xs text-[#8A7B6B]">
              HnC BUILD • HangoutsNChill
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}