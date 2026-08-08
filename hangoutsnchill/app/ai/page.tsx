import NestugeProductWriter from "@/components/ai/NestugeProductWriter";

export default function AIPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="mx-auto max-w-5xl">

        <h1 className="mb-2 text-5xl font-bold">
          🤖 Nestuge AI
        </h1>

        <p className="mb-10 text-gray-600">
          Your intelligent business assistant for creating marketplace listings,
          marketing products, and growing your business.
        </p>

        <NestugeProductWriter />

      </div>

    </main>
  );
}