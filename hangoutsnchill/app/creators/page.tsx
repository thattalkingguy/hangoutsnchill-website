export default function CreatorsPage() {
  const creators = [
    {
      name: "Amina",
      role: "Content Strategist",
      focus: "Audience growth and personal brand building.",
    },
    {
      name: "Kofi",
      role: "Digital Product Coach",
      focus: "Monetization systems for creators.",
    },
    {
      name: "Nia",
      role: "Community Builder",
      focus: "Collaborations and creator-led events.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-4xl font-bold text-slate-900">Creators</h1>
          <p className="mt-4 text-lg text-slate-600">
            Meet the creators shaping digital growth and collaborative learning on HangoutsNChill.
          </p>
        </section>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {creators.map((creator) => (
            <article key={creator.name} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">{creator.name}</h2>
              <p className="mt-2 font-semibold text-blue-600">{creator.role}</p>
              <p className="mt-4 text-slate-600">{creator.focus}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
