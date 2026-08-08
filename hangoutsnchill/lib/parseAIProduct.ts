export type AIProduct = {
  title: string;
  description: string;
  category: string;
  price: string;
  keywords: string;
  marketingCopy: string;
};

export function parseAIProduct(text: string): AIProduct {
  const getValue = (label: string) => {
    const regex = new RegExp(`${label}:([\\s\\S]*?)(?=\\n[A-Z ]+:|$)`, "i");
    const match = text.match(regex);

    return match ? match[1].trim() : "";
  };

  return {
    title: getValue("TITLE"),
    description: getValue("DESCRIPTION"),
    category: getValue("CATEGORY"),
    price: getValue("PRICE"),
    keywords: getValue("KEYWORDS"),
    marketingCopy: getValue("MARKETING COPY"),
  };
}