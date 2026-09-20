export default function TemuEarnPage() {
  const temuUrl = "https://temu.to/k/evoluh1tc32";

  return (
    <main className="min-h-screen bg-[#F7F1E3] p-8 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          HnC90Clock • Shopping & Deals
        </p>

        <div className="mt-4 rounded-3xl bg-black p-8 text-white shadow-xl md:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            HnC × Temu
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Flash Drop. Don't Miss Out.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-300">
            Discover Temu shopping deals and promotional offers through
            HnC90Clock.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-gray-400">Promotion</p>
              <p className="mt-2 text-2xl font-bold">
                ₦100,000 Coupon Bundle
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-sm text-gray-400">First App Order</p>
              <p className="mt-2 text-2xl font-bold">
                30% OFF
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-5 text-gray-900">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Temu Code
            </p>

            <p className="mt-2 text-3xl font-black tracking-widest">
              ALW546283
            </p>
          </div>

          <a
            href={temuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-2xl bg-amber-400 px-8 py-4 text-lg font-bold text-black transition hover:bg-amber-300"
          >
            Unlock Temu Deal →
          </a>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">
            How it works
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <div className="text-3xl">1️⃣</div>
              <h3 className="mt-3 font-bold">Open the deal</h3>
              <p className="mt-2 text-gray-600">
                Use the HnC Temu link to access the promotion.
              </p>
            </div>

            <div>
              <div className="text-3xl">2️⃣</div>
              <h3 className="mt-3 font-bold">Use the code</h3>
              <p className="mt-2 text-gray-600">
                Apply the promotional code where eligible.
              </p>
            </div>

            <div>
              <div className="text-3xl">3️⃣</div>
              <h3 className="mt-3 font-bold">Shop</h3>
              <p className="mt-2 text-gray-600">
                Complete your purchase directly through Temu.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold">
            HnC90Clock Affiliate Disclosure
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-700">
            HnC may earn a commission from qualifying purchases or
            promotional activities completed through eligible affiliate
            links. Offers, discounts, eligibility, coupon values and
            promotional terms are determined by Temu and may change.
          </p>
        </section>

        <div className="mt-8">
          <a
            href="/earn"
            className="font-semibold text-gray-900 underline"
          >
            ← Back to HnC Earn
          </a>
        </div>
      </div>
    </main>
  );
}