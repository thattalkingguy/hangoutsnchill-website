export default function AcademyPage() {
  const courses = [
    {
      title: "Digital Growth Fundamentals",
      description: "Master the core skills needed to build a digital business.",
      tag: "Beginner",
    },
    {
      title: "Content Strategy Lab",
      description: "Create systems for consistent content that attracts your audience.",
      tag: "Intermediate",
    },
    {
      title: "Monetization Playbook",
      description: "Learn how to turn attention into revenue across products and services.",
      tag: "Advanced",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-4xl font-bold text-slate-900">Academy</h1>
          <p className="mt-4 text-lg text-slate-600">
            Practical courses and workshops built for Africa's next wave of creators and entrepreneurs.
          </p>
        </section>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <article key={course.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">{course.tag}</span>
              <h2 className="mt-6 text-2xl font-bold text-slate-900">{course.title}</h2>
              <p className="mt-4 text-slate-600">{course.description}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
