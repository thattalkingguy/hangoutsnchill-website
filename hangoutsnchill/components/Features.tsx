const features = [
  {
    emoji: "🛒",
    title: "Marketplace",
    description: "Discover and sell high-quality digital products."
  },
  {
    emoji: "💬",
    title: "HNC Connect",
    description: "Chat, connect and network anonymously."
  },
  {
    emoji: "🤖",
    title: "AI Concierge",
    description: "Your intelligent assistant for learning and earning."
  },
  {
    emoji: "🎓",
    title: "Academy",
    description: "Master valuable digital and business skills."
  },
  {
    emoji: "💰",
    title: "Pusher Hub",
    description: "Promote products and earn affiliate commissions."
  },
  {
    emoji: "👨‍💼",
    title: "Creator Hub",
    description: "Build your audience and grow your brand."
  },
];

export default function Features() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-4xl font-bold text-gray-900">
          Everything You Need to Learn, Connect & Earn
        </h2>

        <p className="mt-4 text-center text-gray-600">
          One ecosystem. Endless opportunities.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-5xl">{feature.emoji}</div>

              <h3 className="mt-6 text-2xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-3 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}