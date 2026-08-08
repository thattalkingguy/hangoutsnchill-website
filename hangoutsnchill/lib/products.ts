export type Product = {
  title: string;
  price: string;
  category: string;
  slug: string;
  description: string;
  highlights: string[];
};

export const marketplaceProducts: Product[] = [
  {
    title: "AI Business Masterclass",
    price: "$197",
    category: "Course",
    slug: "ai-business-masterclass",
    description: "Build, launch, and scale your digital business using AI-powered tools and frameworks.",
    highlights: [
      "10+ video lessons",
      "Live AI coaching templates",
      "Launch checklist and growth plan",
    ],
  },
  {
    title: "Content Creator Toolkit",
    price: "$99",
    category: "Toolkit",
    slug: "content-creator-toolkit",
    description: "Templates, scripts, and workflows for social media, blogging, and community building.",
    highlights: [
      "Editable content templates",
      "30-day posting calendar",
      "Audience growth checklist",
    ],
  },
  {
    title: "Affiliate Success Blueprint",
    price: "$297",
    category: "eBook",
    slug: "affiliate-success-blueprint",
    description: "A complete step-by-step system for building recurring affiliate income.",
    highlights: [
      "Pitch frameworks",
      "Funnel optimization advice",
      "High-converting promotion templates",
    ],
  },
];
