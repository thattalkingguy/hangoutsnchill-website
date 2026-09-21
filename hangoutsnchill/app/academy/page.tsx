import Link from "next/link";
import { learningCourses } from "@/app/lib/learningCourses";
import { learningPartners } from "@/app/lib/learningPartners";

const hncCourses = [
  {
    title: "Digital Growth Fundamentals",
    description:
      "Master the core skills needed to build a digital business.",
    tag: "Beginner",
  },
  {
    title: "Content Strategy Lab",
    description:
      "Create systems for consistent content that attracts your audience.",
    tag: "Intermediate",
  },
  {
    title: "Monetization Playbook",
    description:
      "Learn how to turn attention into revenue across products and services.",
    tag: "Advanced",
  },
];

const categories = [
  "🤖 AI & Technology",
  "💻 Digital Skills",
  "📈 Business",
  "📣 Digital Marketing",
  "🏠 Real Estate",
  "💰 Finance",
  "🎨 Design",
  "🧑🏽‍💼 Career Skills",
];

export default function AcademyPage() {
  const activeLearningPartners = learningPartners.filter(
    (partner) => partner.active
  );

  const activeLearningCourses = learningCourses.filter(
    (course) => course.active
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <section className="overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-sm md:p-12">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-300">
              HnC Academy
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Learn Free. Grow Free.
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Discover practical HnC courses alongside learning opportunities
              from established education platforms.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                🎓 Free learning opportunities
              </span>

              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                🤖 Ayo can help you navigate
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
              Ask Ayo
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Tell Ayo what you want to learn.
            </h2>

            <p className="mt-2 max-w-2xl text-slate-600">
              Ayo can help you find your way around HnC and point you toward
              learning opportunities that match your interests.
            </p>
          </div>

          <Link
            href="/ai"
            className="inline-flex rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Chat with Ayo →
          </Link>
        </section>

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
              Learn your way
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Explore learning categories
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
              >
                {category}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
              HnC Learning
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Courses built for HnC
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {hncCourses.map((course) => (
              <article
                key={course.title}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-600">
                  {course.tag}
                </span>

                <h3 className="mt-6 text-2xl font-bold">{course.title}</h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {course.description}
                </p>

                <button
                  type="button"
                  className="mt-7 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Coming Soon
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-[2rem] border border-sky-100 bg-sky-50 p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
              HnC Free Learning
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Start learning without paying HnC.
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              HnC helps you discover learning opportunities from established
              education platforms. Some courses are free to study, while
              certificates or other features may have separate costs.
            </p>

            <div className="mt-5 rounded-2xl border border-sky-200 bg-white p-5 text-sm leading-6 text-slate-600">
              <strong className="text-slate-900">Important:</strong> “Free to
              study” does not automatically mean “free certificate.” Always
              check the current course and certificate terms on the provider's
              official website before enrolling or purchasing anything.
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
              Course Discovery
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Explore learning opportunities
            </h2>

            <p className="mt-2 max-w-3xl text-slate-600">
              Browse learning opportunities organized by skill and provider.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeLearningCourses.map((course) => {
              const provider = learningPartners.find(
                (partner) => partner.id === course.providerId
              );

              return (
                <article
                  key={course.id}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {provider?.name || "HnC Learning"}
                    </span>

                    <span className="text-xs font-semibold text-sky-600">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-bold">
                    {course.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {course.description}
                  </p>

                  <div className="mt-6 space-y-2">
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold">
                      📚 {course.learningType}
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold">
                      🎓 {course.certificateNote}
                    </div>
                  </div>

                  <a
                    href={
                      provider?.affiliateUrl ||
                      course.officialUrl ||
                      provider?.officialUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Explore Learning →
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold">
              💡 How HnC Free Learning works
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-4">
              <div>
                <div className="text-2xl">1️⃣</div>
                <h3 className="mt-2 font-bold">Choose</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Tell Ayo what you want to learn.
                </p>
              </div>

              <div>
                <div className="text-2xl">2️⃣</div>
                <h3 className="mt-2 font-bold">Discover</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Explore relevant learning opportunities.
                </p>
              </div>

              <div>
                <div className="text-2xl">3️⃣</div>
                <h3 className="mt-2 font-bold">Learn</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Start with free learning options where available.
                </p>
              </div>

              <div>
                <div className="text-2xl">4️⃣</div>
                <h3 className="mt-2 font-bold">Grow</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Build skills and pursue certificates where useful.
                </p>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-10 text-center text-xs leading-6 text-slate-500">
          HnC may earn commissions from qualifying purchases made through
          participating affiliate programmes. Affiliate availability,
          commissions, course pricing, and certificate terms can change.
          HnC does not control third-party course providers.
        </p>
      </div>
    </main>
  );
}