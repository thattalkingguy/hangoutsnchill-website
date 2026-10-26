
export type AffiliatePartner = {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string;
  affiliateUrl?: string;
  programUrl?: string;
  partnerUrl?: string;
  referralCode?: string;
  partnerReferralCode?: string;
  active: boolean;
};

export const affiliatePartners: AffiliatePartner[] = [
  {
    id: "deriv",
    name: "Deriv",
    category: "Trading & Financial Education",
    description:
      "Explore trading education, Deriv platforms, and the Deriv Partners programme.",
    route: "/earn/deriv",
    affiliateUrl: "https://t.deriv.link?t=FDP3V4K5KF25",
    referralCode: "L3MBCW6SQ3QA",
    partnerUrl: "https://t.deriv.link?t=VBDLSJE7PHLJ",
    partnerReferralCode: "M5CWH73AYFS5",
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
  {
    id: "airbnb",
    name: "Airbnb",
    category: "Travel & Accommodation",
    description:
      "Discover accommodation worldwide with HnC travel guidance from Ayo.",
    route: "/earn/airbnb",
    affiliateUrl: "https://airbnb.com/rp/hnc90clock",
    programUrl: "https://creators.withairbnb.com/splash",
    active: true,
  },

  // Gift card partners
  // Keep inactive until HnC has a verified referral URL.
  {
    id: "amazon-gift-cards",
    name: "Amazon Gift Cards",
    category: "Gift Cards",
    description:
      "Gift card discovery and potential affiliate partnership.",
    route: "/gift-cards",
    programUrl: "https://affiliate-program.amazon.com/",
    active: false,
  },
  {
    id: "apple-gift-cards",
    name: "Apple Gift Cards",
    category: "Gift Cards",
    description:
      "Gift card discovery and potential authorized partner opportunities.",
    route: "/gift-cards",
    programUrl: "https://www.apple.com/shop/gift-cards",
    active: false,
  },
  {
    id: "google-play-gift-cards",
    name: "Google Play Gift Cards",
    category: "Gift Cards",
    description:
      "Gift card discovery and potential distribution partnerships.",
    route: "/gift-cards",
    programUrl: "https://play.google.com/about/giftcards/",
    active: false,
  },
  {
    id: "steam-gift-cards",
    name: "Steam Gift Cards",
    category: "Gift Cards",
    description:
      "Gift card discovery and potential authorized distribution partnerships.",
    route: "/gift-cards",
    programUrl: "https://store.steampowered.com/digitalgiftcards/",
    active: false,
  },
  {
    id: "playstation-gift-cards",
    name: "PlayStation Store Cards",
    category: "Gift Cards",
    description:
      "Gift card discovery and potential authorized distribution partnerships.",
    route: "/gift-cards",
    programUrl: "https://www.playstation.com/",
    active: false,
  },
  {
    id: "xbox-gift-cards",
    name: "Xbox Gift Cards",
    category: "Gift Cards",
    description:
      "Gift card discovery and potential authorized distribution partnerships.",
    route: "/gift-cards",
    programUrl: "https://www.xbox.com/",
    active: false,
  },
  {
    id: "stanbic-ibtc-gift-cards",
    name: "Stanbic IBTC Digital Gifts",
    category: "Gift Cards",
    description:
      "Potential Nigerian digital gift and voucher opportunity. Product availability and partnership require verification.",
    route: "/gift-cards",
    programUrl: "https://www.stanbicibtcbank.com/",
    active: false,
  },
];
