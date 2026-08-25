export type AffiliatePartner = {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string;
  affiliateUrl?: string;
  active: boolean;
};

export const affiliatePartners: AffiliatePartner[] = [
  {
    id: "deriv",
    name: "Deriv",
    category: "Trading & Financial Education",
    description: "Explore trading education and Deriv official trading platforms.",
    route: "/earn/deriv",
    affiliateUrl: "https://track.deriv.com/_H2OBoLjntcP1hit6RV3zsGNd7ZgqdRLk/1/",
    active: true,
  },
];
