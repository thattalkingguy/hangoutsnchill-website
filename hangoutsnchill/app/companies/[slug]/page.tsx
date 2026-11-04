
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CustomerFirstForms from "@/components/customer-first/CustomerFirstForms";

export const dynamic = "force-dynamic";

type Company = {
  company_name: string;
  trading_name: string | null;
  description: string | null;
  industry: string | null;
  services: string[] | null;
  country: string | null;
  state: string | null;
  city: string | null;
  lga: string | null;
  street_address: string | null;
  building_name: string | null;
  floor_suite: string | null;
  landmark: string | null;
  directions: string | null;
  latitude: number | null;
  longitude: number | null;
  public_phone: string | null;
  public_email: string | null;
  website_url: string | null;
  whatsapp: string | null;
  cac_registration_status: string;
  address_last_confirmed_at: string | null;
  information_last_reviewed_at: string | null;
  opening_hours: Record<string, string> | null;
};

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from("hnc_company_directory")
    .select(
      "company_name,trading_name,description,industry,services,country,state,city,lga,street_address,building_name,floor_suite,landmark,directions,latitude,longitude,public_phone,public_email,website_url,whatsapp,cac_registration_status,address_last_confirmed_at,information_last_reviewed_at,opening_hours"
    )
    .eq("slug", slug)
    .eq("listing_status", "published")
    .maybeSingle();

  if (error) {
    console.error("Company profile lookup failed:", error.message);
    throw new Error("Unable to load this company profile.");
  }

  if (!data) notFound();

  const company = data as Company;

  const address = [
    company.floor_suite,
    company.building_name,
    company.street_address,
    company.lga,
    company.city,
    company.state,
    company.country,
  ]
    .filter(Boolean)
    .join(", ");

  const mapQuery =
    company.latitude !== null && company.longitude !== null
      ? `${company.latitude},${company.longitude}`
      : address;

  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

  const websiteUrl = company.website_url
    ? /^https?:\/\//i.test(company.website_url)
      ? company.website_url
      : `https://${company.website_url}`
    : null;

  const whatsappNumber = company.whatsapp?.replace(/[^\d]/g, "");

  const registrationLabel =
    company.cac_registration_status === "confirmed"
      ? "Registration confirmed"
      : company.cac_registration_status === "pending"
        ? "Registration check pending"
        : company.cac_registration_status === "not_confirmed"
          ? "Registration not confirmed"
          : "Registration status not yet confirmed";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to Company Finder
        </Link>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            HnC Company Finder
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {company.company_name}
          </h1>

          {company.trading_name && (
            <p className="mt-2 text-lg text-slate-600">
              Also known as {company.trading_name}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {company.industry && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800">
                {company.industry}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
              {registrationLabel}
            </span>
          </div>

          {company.description && (
            <p className="mt-6 whitespace-pre-line leading-7 text-slate-700">
              {company.description}
            </p>
          )}
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Office address</h2>

            {address ? (
              <p className="mt-4 leading-7 text-slate-700">{address}</p>
            ) : (
              <p className="mt-4 text-slate-500">
                This company has not supplied a complete public office address yet.
              </p>
            )}

            {company.landmark && (
              <p className="mt-4 text-sm text-slate-600">
                <strong>Nearby landmark:</strong> {company.landmark}
              </p>
            )}

            {company.directions && (
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                <strong>Directions:</strong> {company.directions}
              </p>
            )}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
              >
                Open location in Google Maps
              </a>
            )}

            {company.address_last_confirmed_at && (
              <p className="mt-4 text-xs text-slate-500">
                Address last confirmed:{" "}
                {new Date(company.address_last_confirmed_at).toLocaleDateString(
                  "en-NG",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Contact this company</h2>

            <div className="mt-4 space-y-4 text-sm">
              {company.public_phone && (
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    className="text-blue-700 hover:underline"
                    href={`tel:${company.public_phone}`}
                  >
                    {company.public_phone}
                  </a>
                </p>
              )}

              {company.public_email && (
                <p className="break-words">
                  <strong>Email:</strong>{" "}
                  <a
                    className="text-blue-700 hover:underline"
                    href={`mailto:${company.public_email}`}
                  >
                    {company.public_email}
                  </a>
                </p>
              )}

              {websiteUrl && (
                <p className="break-words">
                  <strong>Website:</strong>{" "}
                  <a
                    className="text-blue-700 hover:underline"
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit company website
                  </a>
                </p>
              )}

              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
                >
                  Contact on WhatsApp
                </a>
              )}

              {!company.public_phone &&
                !company.public_email &&
                !websiteUrl &&
                !whatsappNumber && (
                  <p className="leading-6 text-slate-500">
                    Public contact details are not available yet. Ayo helps
                    identify missing company information.
                  </p>
                )}
            </div>
          </section>
        </div>

        <div className="mt-6">
          <CustomerFirstForms
            companySlug={slug}
            companyName={company.company_name}
          />
        </div>

        {company.services && company.services.length > 0 && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Services</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {company.services.map((service) => (
                <span
                  key={service}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"
                >
                  {service}
                </span>
              ))}
            </div>
          </section>
        )}

        {company.opening_hours &&
          Object.keys(company.opening_hours).length > 0 && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold">Opening hours</h2>
              <div className="mt-4 space-y-2">
                {Object.entries(company.opening_hours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex flex-wrap justify-between gap-3 border-b border-slate-100 py-2 text-sm"
                  >
                    <span className="font-medium capitalize">{day}</span>
                    <span className="text-slate-600">{hours}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        {company.information_last_reviewed_at && (
          <p className="mt-6 text-center text-xs text-slate-500">
            Information last reviewed:{" "}
            {new Date(company.information_last_reviewed_at).toLocaleDateString(
              "en-NG",
              { day: "numeric", month: "short", year: "numeric" }
            )}
          </p>
        )}

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          <p>Powered by Ayo - Joy is fine.</p>
          <Link
            href="/companies"
            className="mt-2 inline-block font-semibold text-blue-700 hover:underline"
          >
            Find another company
          </Link>
        </footer>
      </div>
    </main>
  );
}
