import Link from "next/link";

export default function EAffidavitPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            ← Back to HnC
          </Link>

          <div className="mt-10 max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              HnC Public Service
            </div>

            <h1 className="mt-7 text-5xl font-black leading-tight tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Need an
              <span className="block text-emerald-400">
                E-Affidavit?
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              HnC is making it easier for Nigerians to find and access the
              official Federal High Court e-Affidavit service.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                No HnC membership required
              </span>

              <span className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950">
                HnC service fee: ₦0
              </span>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://portal.fhc.gov.ng/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-400 px-8 py-4 text-center font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                Start E-Affidavit →
              </a>

              <a
                href="https://fhc.gov.ng/e-affidavit-client-portal/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-8 py-4 text-center font-bold text-white transition hover:border-emerald-400/50 hover:bg-white/5"
              >
                Learn About the Service
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950 p-7">
              <div className="text-4xl">👤</div>

              <h2 className="mt-5 text-xl font-black">
                Open to Everyone
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                You do not need to be an HnC member to use this public-service
                information and access the official portal.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950 p-7">
              <div className="text-4xl">🏛️</div>

              <h2 className="mt-5 text-xl font-black">
                Official Court Portal
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                The actual affidavit application, payment, processing and
                certification take place through the Federal High Court's
                official e-Affidavit system.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950 p-7">
              <div className="text-4xl">💰</div>

              <h2 className="mt-5 text-xl font-black">
                No HnC Service Fee
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                HnC does not charge a service fee for directing visitors to
                the official service. Any applicable government or court
                charges are separate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            How it works
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Start from HnC. Finish through the official system.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            HnC provides a simple starting point. The Federal High Court's
            official platform handles the actual affidavit process.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {[
            {
              number: "01",
              title: "Start",
              text: "Click Start E-Affidavit from HnC.",
            },
            {
              number: "02",
              title: "Apply",
              text: "Follow the official portal's application process.",
            },
            {
              number: "03",
              title: "Pay",
              text: "Pay any applicable official fees through the approved portal.",
            },
            {
              number: "04",
              title: "Receive",
              text: "Complete the official process and access your affidavit as provided by the Court.",
            },
          ].map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <div className="text-sm font-black text-emerald-400">
                {step.number}
              </div>

              <h3 className="mt-4 text-xl font-black">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-emerald-400 text-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em]">
              HnC90Clock • Coming Soon
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              More useful public services are coming to HnC.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-900/75">
              We're building HnC into a place where people can discover useful
              services, opportunities, businesses, education and tools.
            </p>

            <Link
              href="/"
              className="mt-8 inline-block rounded-full bg-slate-950 px-8 py-4 font-bold text-white transition hover:bg-slate-800"
            >
              Explore HnC →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-7">
          <h2 className="text-lg font-black">
            Important information
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            HnC is currently providing this page as an information and access
            point. HnC is not representing itself as the Federal High Court of
            Nigeria and is not currently claiming to be an accredited Court
            partner. The official e-Affidavit application, payment, review and
            certification are handled through the Federal High Court's
            designated system.
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Do not send sensitive identity documents or personal information
            to HnC through this page. Use the official Federal High Court
            portal for the actual application process.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center lg:px-8">
          <p className="text-sm text-slate-500">
            HnC Public Service • E-Affidavit Access
          </p>
        </div>
      </footer>
    </main>
  );
}