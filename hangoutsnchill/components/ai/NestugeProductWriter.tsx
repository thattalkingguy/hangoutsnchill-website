"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NestugeProductWriter() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!idea.trim()) {
      alert("Enter a product idea.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/ai/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Generation failed.");
      }

      setResult(data.result);

    } catch (error) {
      console.error(error);
      alert("Unable to generate product.");
    }

    setLoading(false);
  }

  return (
    <Card
      title="🤖 Nestuge AI"
      subtitle="Generate your marketplace listing"
    >

      <textarea
        rows={5}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Example: Canva Instagram Templates for Fashion Brands"
        className="w-full rounded-xl border p-4"
      />

      <div className="mt-6">

        <Button
          onClick={generate}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Generate Product"}
        </Button>

      </div>

      {result && (

        <div className="mt-8 rounded-xl bg-gray-100 p-6">

          <h3 className="mb-4 text-xl font-bold">
            AI Result
          </h3>

          <pre className="whitespace-pre-wrap text-sm">
            {result}
          </pre>

        </div>

      )}

    </Card>
  );
}