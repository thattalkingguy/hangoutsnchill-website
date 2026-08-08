"use client";

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">
          Add Product
        </h1>

        <p className="mt-2 text-gray-500">
          Sell your digital products on HangoutsNChill.
        </p>

        <form className="mt-8 space-y-5">

          <input
            type="text"
            placeholder="Product Title"
            className="w-full rounded-lg border p-3"
          />

          <textarea
            placeholder="Description"
            className="w-full rounded-lg border p-3"
            rows={5}
          />

          <input
            type="number"
            placeholder="Price"
            className="w-full rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Category"
            className="w-full rounded-lg border p-3"
          />

          <input
            type="text"
            placeholder="Image URL"
            className="w-full rounded-lg border p-3"
          />

          <button
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Save Product
          </button>

        </form>
      </div>
    </main>
  );
}