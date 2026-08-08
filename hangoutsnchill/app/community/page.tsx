export default function CommunityPage() {
  const benefits = [
    "Network with creators, mentors, and founders",
    "Share growth insights and collaboration opportunities",
    "Access live events, challenges, and workshops",
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-4xl font-bold text-slate-900">Community</h1>
          <p className="mt-4 text-lg text-slate-600">
            Join a supportive network of creators, entrepreneurs, and digital makers.
          </p>
        </section>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-slate-700">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
