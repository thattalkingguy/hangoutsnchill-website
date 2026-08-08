const stats = [
  {
    number: "10K+",
    label: "Future Members",
  },
  {
    number: "500+",
    label: "Digital Products",
  },
  {
    number: "$1M+",
    label: "Affiliate Sales Goal",
  },
  {
    number: "24/7",
    label: "AI Support",
  },
];

export default function Stats() {
  return (
    <section className="bg-blue-600 py-16 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <h2 className="text-4xl font-bold">{stat.number}</h2>
            <p className="mt-2 text-blue-100">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}