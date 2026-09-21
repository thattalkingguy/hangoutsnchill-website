export type LearningPartner = {
  id: string;
  name: string;
  category: string;
  description: string;
  learningStatus: string;
  certificateStatus: string;
  officialUrl: string;
  affiliateUrl?: string;
  active: boolean;
};

export const learningPartners: LearningPartner[] = [
  {
    id: "alison",
    name: "Alison",
    category: "Business & Digital Skills",
    description:
      "Explore self-paced learning opportunities across business, technology, marketing, personal development, and more.",
    learningStatus: "FREE TO STUDY",
    certificateStatus: "Certificate: Check individual course",
    officialUrl: "https://alison.com/",
    active: true,
  },

  {
    id: "coursera",
    name: "Coursera",
    category: "Technology & Career",
    description:
      "Explore courses from universities and organizations across technology, business, data, AI, and professional skills.",
    learningStatus: "FREE OPTIONS",
    certificateStatus: "Certificate: Course dependent",
    officialUrl: "https://www.coursera.org/",
    active: true,
  },

  {
    id: "edx",
    name: "edX",
    category: "Education & Professional Skills",
    description:
      "Discover courses from universities and institutions covering technology, business, science, humanities, and professional development.",
    learningStatus: "FREE OPTIONS",
    certificateStatus: "Certificate: Course dependent",
    officialUrl: "https://www.edx.org/",
    active: true,
  },
];