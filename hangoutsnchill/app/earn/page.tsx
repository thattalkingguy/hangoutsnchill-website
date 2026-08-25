import { affiliatePartners } from "@/app/lib/affiliatePartners";

export default function EarnPage() {
  const partners = affiliatePartners.filter((partner) => partner.active);

  return (
    <main className="min-h-screen bg-[#F7F1E3] p-8 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          HnC Earn
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Learn. Connect. Earn.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-700">
          Discover trusted partner opportunities, educational resources, and services available through HangoutsNChill.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">
            Trading & Financial Education
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {partners.map((partner) => (
              <article
                key={partner.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                  {partner.category}
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  {partner.name}
                </h3>

                <p className="mt-3 text-gray-700">
                  {partner.description}
                </p>

                <a
                  href={partner.route}
                  className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
                >
                  Explore {partner.name}
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
