export type AffiliatePartner = {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string;
  affiliateUrl?: string;
  programUrl?: string;
  active: boolean;
};

export const affiliatePartners: AffiliatePartner[] = [
  {
    id: "deriv",
    name: "Deriv",
    category: "Trading & Financial Education",
    description:
      "Explore trading education and Deriv official trading platforms.",
    route: "/earn/deriv",
    affiliateUrl:
      "https://track.deriv.com/_H2OBoLjntcP1hit6RV3zsGNd7ZgqdRLk/1/",
    active: true,
  },
  {
    id: "temu",
    name: "Temu",
    category: "Shopping & Deals",
    description:
      "Discover Temu deals, first-order promotions, and shopping opportunities through HnC90Clock.",
    route: "/earn/temu",
    affiliateUrl: "https://temu.to/k/evoluh1tc32",
    active: true,
  },
  {
    id: "mtn-eshop",
    name: "MTN eShop",
    category: "iPhone & Affiliate Commerce",
    description:
      "Explore the MTN eShop affiliate opportunity for qualifying purchases. HnC approval or enrollment is not assumed.",
    route: "/iphone18",
    programUrl: "https://uat-shop.mtn.ng/affiliate-marketing",
    active: true,
  },
];