import Link from "next/link";

const featuredProducts = [
  {
    title: "AI Business Masterclass",
    category: "Course",
    price: "$197",
    description: "Learn how to build, launch, and grow a digital product with AI-driven workflows.",
  },
  {
    title: "Content Creator Toolkit",
    category: "Toolkit",
    price: "$99",
    description: "Templates, scripts, and systems for consistent audience growth.",
  },
  {
    title: "Affiliate Success Blueprint",
    category: "eBook",
    price: "$297",
    description: "A complete guide to monetizing your online presence with affiliate marketing.",
  },
];

export default function MarketplacePreview() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-4xl font-bold text-center text-gray-900">
          Featured Digital Products
        </h2>

        <p className="mt-4 text-center text-gray-600">
          Discover high-value products that help you grow your skills and income.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <div key={product.title} className="rounded-2xl border p-6 shadow-sm transition hover:shadow-lg">
              <div className="rounded-xl bg-blue-100 p-10 text-center text-5xl">📦</div>

              <span className="mt-6 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">
                {product.category}
              </span>

              <h3 className="mt-4 text-2xl font-bold">{product.title}</h3>
              <p className="mt-4 text-gray-600">{product.description}</p>
              <p className="mt-6 text-3xl font-bold text-blue-600">{product.price}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/marketplace" className="inline-flex rounded-full bg-blue-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-blue-700">
            Browse the full marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}