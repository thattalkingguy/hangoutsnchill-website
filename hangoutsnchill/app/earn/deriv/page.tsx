const DERIV_AFFILIATE_URL =
  "https://track.deriv.com/_H2OBoLjntcP1hit6RV3zsGNd7ZgqdRLk/1/";

export default function DerivPage() {
  return (
    <main className="min-h-screen bg-[#F7F1E3] px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
            HnC Earn
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Learn About Deriv
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-700">
            Explore Deriv&apos;s trading platforms and educational resources
            while learning about online trading, financial markets, and the
            risks involved.
          </p>

          <a
            href={DERIV_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-8 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Explore Deriv
          </a>
        </div>

        {/* What is Deriv? */}
        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold">What is Deriv?</h2>

          <p className="mt-4 leading-7 text-gray-700">
            Deriv is an online trading platform provider offering access to
            different financial markets and trading products.
          </p>
        </section>

        {/* Beginner Information */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold">Beginner Information</h2>

          <p className="mt-4 leading-7 text-gray-700">
            Beginners should first learn how trading works, understand the
            products and risks involved, and make independent decisions before
            using real money.
          </p>

          <ul className="mt-5 list-disc space-y-2 pl-6 text-gray-700">
            <li>Learn how the platform and trading products work.</li>
            <li>Understand the risks before committing money.</li>
            <li>Never trade money you cannot afford to lose.</li>
            <li>Make your own independent financial decisions.</li>
          </ul>
        </section>

        {/* Risk Disclosure */}
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-red-900">
            Important Risk Disclosure
          </h2>

          <p className="mt-4 leading-7 text-red-900">
            Trading involves substantial financial risk. You may lose some or
            all of the money you commit to trading. Never trade money you
            cannot afford to lose.
          </p>

          <p className="mt-4 leading-7 text-red-900">
            This page provides general educational information only. It is not
            personalised financial, investment, or trading advice.
          </p>
        </section>

        {/* Affiliate Disclosure */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold">Affiliate Disclosure</h2>

          <p className="mt-4 leading-7 text-gray-700">
            HangoutsNChill is a Deriv affiliate and partner. HnC may receive
            compensation from eligible referrals made through links on this
            page. This does not guarantee trading results or profits.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-10 pb-12">
          <h2 className="text-3xl font-bold">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-4">
            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Is trading on Deriv guaranteed to make money?
              </summary>

              <p className="mt-3 leading-7 text-gray-700">
                No. Trading involves risk and there are no guaranteed profits.
              </p>
            </details>

            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Does HnC provide financial advice?
              </summary>

              <p className="mt-3 leading-7 text-gray-700">
                No. HnC provides general educational information and does not
                provide personalised financial or investment advice.
              </p>
            </details>

            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Can HnC trade on my behalf?
              </summary>

              <p className="mt-3 leading-7 text-gray-700">
                No. HnC does not place trades on behalf of users.
              </p>
            </details>

            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Should I deposit money just so HnC can earn a commission?
              </summary>

              <p className="mt-3 leading-7 text-gray-700">
                No. Users should never deposit or trade solely to increase
                HnC&apos;s affiliate compensation.
              </p>
            </details>
          </div>
        </section>

        {/* Final CTA */}
        <div className="border-t border-gray-300 pt-8 text-center">
          <p className="text-sm text-gray-600">
            Interested in learning more about Deriv?
          </p>

          <a
            href={DERIV_AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-4 inline-block rounded-xl bg-amber-700 px-6 py-3 font-semibold text-white transition hover:bg-amber-800"
          >
            Visit Deriv
          </a>
        </div>
      </div>
    </main>
  );
}