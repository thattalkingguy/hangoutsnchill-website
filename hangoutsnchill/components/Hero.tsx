export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
          🚀 Welcome to HangoutsNChill
        </span>

        <h1 className="mt-8 text-5xl font-extrabold text-gray-900 md:text-7xl">
          Learn.
          <span className="text-blue-600"> Connect.</span>
          <br />
          Earn.
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-xl text-gray-600">
          Africa's Digital Growth Ecosystem where creators, entrepreneurs,
          businesses and learners come together to grow, collaborate and earn.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/auth/signup"
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
          >
            Join Free
          </a>

          <a
            href="/marketplace"
            className="rounded-xl border border-blue-600 px-8 py-4 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Explore Marketplace
          </a>
        </div>
      </div>
    </section>
  );
}