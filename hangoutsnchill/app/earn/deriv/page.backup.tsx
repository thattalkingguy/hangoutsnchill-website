const DERIV_AFFILIATE_URL = "https://track.deriv.com/_H2OBoLjntcP1hit6RV3zsGNd7ZgqdRLk/1/";

export default function DerivPage() {
  return (
    <main className="min-h-screen bg-[#F7F1E3] p-8 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          HnC Earn - Trading & Financial Education
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Learn About Deriv
        </h1>

        <p className="mt-6 text-lg text-gray-700">
          Explore Deriv's trading platforms and educational resources while
          learning about online trading and its risks.
        </p>

        <a
          href={DERIV_AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-8 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
        >
          Explore Deriv
        </a>

        <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">What is Deriv?</h2>
          <p className="mt-4 text-gray-700">
            Deriv is an online trading platform provider offering access to
            different financial markets and trading products.
          </p>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Beginner Information</h2>
          <p className="mt-4 text-gray-700">
            Beginners should learn how trading works, understand the products
            and risks involved, and make independent decisions before using
            real money.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-2xl font-bold text-red-900">
            Important Risk Disclosure
          </h2>
          <p className="mt-4 text-red-900">
            Trading involves substantial financial risk. You may lose some or
            all of the money you commit to trading. Never trade money you
            cannot afford to lose. This page provides general educational
            information and is not personalised financial or investment advice.
          </p>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Affiliate Disclosure</h2>
          <p className="mt-4 text-gray-700">
            HangoutsNChill is a Deriv affiliate and partner. HnC may receive
            compensation from eligible referrals. This does not guarantee
            trading results.
          </p>
        </section>

        <section className="mt-6 pb-12">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>

          <div className="mt-6 space-y-4">
            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Is trading on Deriv guaranteed to make money?
              </summary>
              <p className="mt-3 text-gray-700">
                No. Trading involves risk and there are no guaranteed profits.
              </p>
            </details>

            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Does HnC provide financial advice?
              </summary>
              <p className="mt-3 text-gray-700">
                No. HnC provides general educational information and not
                personalised financial or investment advice.
              </p>
            </details>

            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Can HnC trade on my behalf?
              </summary>
              <p className="mt-3 text-gray-700">
                No. HnC does not place trades on behalf of users.
              </p>
            </details>

            <details className="rounded-xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Should I deposit money just so HnC can earn a commission?
              </summary>
              <p className="mt-3 text-gray-700">
                No. Users should never deposit or trade solely to increase
                HnC's affiliate compensation.
              </p>
            </details>
          </div>
        </section>
      </div>
    </main>
  );
}
