export type LearningCourse = {
  id: string;
  title: string;
  category: string;
  providerId: string;
  description: string;
  learningType: string;
  certificateNote: string;
  officialUrl: string;
  active: boolean;
};

export const learningCourses: LearningCourse[] = [
  {
    id: "ai-foundations-alison",
    title: "AI Foundations",
    category: "AI & Technology",
    providerId: "alison",
    description:
      "Explore introductory artificial intelligence concepts and build a foundation for understanding AI.",
    learningType: "Provider course — check current availability",
    certificateNote: "Certificate terms depend on the specific course.",
    officialUrl: "https://alison.com/",
    active: true,
  },

  {
    id: "ai-courses-coursera",
    title: "AI & Machine Learning Courses",
    category: "AI & Technology",
    providerId: "coursera",
    description:
      "Explore AI, machine learning, generative AI, and related technology courses from universities and organizations.",
    learningType: "Free options may be available",
    certificateNote: "Certificate availability and pricing are course-dependent.",
    officialUrl: "https://www.coursera.org/",
    active: true,
  },

  {
    id: "ai-courses-edx",
    title: "Artificial Intelligence Courses",
    category: "AI & Technology",
    providerId: "edx",
    description:
      "Explore artificial intelligence and related technology learning opportunities from universities and institutions.",
    learningType: "Free options may be available",
    certificateNote: "Verified certificate terms and pricing are course-dependent.",
    officialUrl: "https://www.edx.org/",
    active: true,
  },

  {
    id: "digital-marketing-alison",
    title: "Digital Marketing Courses",
    category: "Digital Marketing",
    providerId: "alison",
    description:
      "Explore digital marketing learning opportunities covering areas such as online marketing, social media, and marketing strategy.",
    learningType: "FREE TO STUDY options",
    certificateNote: "Certificate terms depend on the specific course.",
    officialUrl: "https://alison.com/",
    active: true,
  },

  {
    id: "digital-skills-coursera",
    title: "Digital Skills Courses",
    category: "Digital Skills",
    providerId: "coursera",
    description:
      "Explore courses covering digital tools, technology, business, data, and professional skills.",
    learningType: "Free options may be available",
    certificateNote: "Certificate availability and pricing are course-dependent.",
    officialUrl: "https://www.coursera.org/",
    active: true,
  },

  {
    id: "technology-edx",
    title: "Technology Courses",
    category: "Digital Skills",
    providerId: "edx",
    description:
      "Explore technology and professional learning opportunities from universities and institutions.",
    learningType: "Free options may be available",
    certificateNote: "Certificate terms depend on the specific course.",
    officialUrl: "https://www.edx.org/",
    active: true,
  },
];