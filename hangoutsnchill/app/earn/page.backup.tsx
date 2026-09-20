export default function EarnPage() {
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

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Trading & Financial Education
          </p>

          <h2 className="mt-2 text-2xl font-bold">Deriv</h2>

          <p className="mt-3 text-gray-700">
            Explore trading education and Deriv's official trading platforms.
          </p>

          <a href="/earn/deriv" className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white">
            Explore Deriv
          </a>
        </section>
      </div>
    </main>
  );
}
