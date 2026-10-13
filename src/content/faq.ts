import type { FaqItem } from "./types";

/**
 * Answers for the "Chat with me" widget. No AI model is involved: typed questions are matched
 * against `keywords` (see src/lib/faq-match.ts), and unmatched questions fall back to an email
 * capture. Keywords match the start of a word, so "intern" also catches "internship".
 * The questions people ask, answered or not, show up in /admin/chats.
 */

export const chatGreeting =
  "Hi, I'm Jay's assistant. Pick a question below or type your own, and I'll answer from what Jay has written here.";

export const chatFallback =
  "I don't have an answer for that yet. Leave your email and question, and Jay will get back to you.";

export const faq: FaqItem[] = [
  {
    id: "what-do-you-build",
    question: "What do you build?",
    answer:
      "Web apps and online stores for businesses. That includes custom web applications built from scratch, business websites, and e-commerce stores with real checkout and payments. I also build data pipelines and dashboards, which is the direction I'm growing in.",
    keywords: ["build", "make", "services", "offer", "do you do", "website", "web app", "store"],
    action: { label: "See my work", target: "work" },
  },
  {
    id: "start-a-project",
    question: "How do I start a project with you?",
    answer:
      "Send a short description through the contact form, or book a call. Tell me what the business does, what you want built and any deadline you have. I'll reply with questions or a suggested next step.",
    keywords: ["start", "begin", "hire", "work with", "get started", "onboard", "process"],
    action: { label: "Go to contact form", target: "contact" },
  },
  {
    id: "cost",
    question: "How much does a project cost?",
    answer:
      "It depends on the scope: what needs to be built, how many features, and whether payments or integrations are involved. Share the details through the contact form or book a call, and I'll give you a clear quote.",
    keywords: ["cost", "price", "pricing", "charge", "budget", "how much", "rate", "fee", "quote"],
    action: { label: "Book a call", target: "book" },
  },
  {
    id: "timeline",
    question: "How long does a project take?",
    answer:
      "That depends on scope too. A focused business site is much quicker than a custom web app with accounts, payments and a dashboard. Once I understand what you need, I'll give you a realistic timeline before any work starts.",
    keywords: [
      "how long",
      "long",
      "take",
      "time",
      "timeline",
      "weeks",
      "duration",
      "deadline",
      "fast can you",
      "when",
    ],
  },
  {
    id: "stack",
    question: "What tech stack do you use?",
    answer:
      "For web work: Next.js, React, TypeScript and Tailwind CSS, with PostgreSQL (often through Supabase) or MySQL, deployed on Vercel, and Paystack for payments. For data work: Python, Airflow, Kafka, FastAPI, PostgreSQL, Qdrant and Docker.",
    keywords: ["stack", "tech", "technology", "framework", "language", "next", "react", "python", "tools"],
  },
  {
    id: "weblanda",
    question: "What is Weblanda?",
    answer:
      "Weblanda is the e-commerce platform I founded and built. It lets Nigerian small businesses run their own online store, with checkout, delivery and a seller dashboard, all from a phone. Sellers are paid directly into their own Paystack subaccounts, and Weblanda takes no cut of sales.",
    keywords: ["weblanda", "platform", "your company", "startup", "e-commerce", "ecommerce"],
    action: { label: "Read the case study", target: "case-study", slug: "weblanda" },
  },
  {
    id: "roles",
    question: "Are you open to roles or internships?",
    answer:
      'Yes. I\'m open to development and data engineering roles and internships. Use the contact form and choose "Job or role", or download my CV.',
    keywords: [
      "role",
      "job",
      "internship",
      "intern",
      "hiring",
      "position",
      "employ",
      "recruit",
      "vacancy",
      "cv",
      "resume",
    ],
    action: { label: "Download CV", target: "cv" },
  },
  {
    id: "research",
    question: "Are you open to research or academic collaboration?",
    answer:
      "Yes. I have a biology degree and I'm a co-author on a peer-reviewed paper on anaerobic digestion. I'm especially interested in data work on biological and health data. Choose \"Research or academic\" on the contact form and tell me about the project.",
    keywords: [
      "research",
      "academic",
      "collaborat",
      "university",
      "msc",
      "masters",
      "study",
      "paper",
      "publication",
      "science",
    ],
    action: { label: "Go to contact form", target: "contact" },
  },
  {
    id: "location",
    question: "Where are you based?",
    // TODO: add whether you work with clients or employers remotely.
    answer: "I'm based in Lagos, Nigeria.",
    keywords: ["where", "based", "location", "located", "country", "lagos", "nigeria", "remote", "timezone"],
  },
  {
    id: "reply-time",
    question: "How fast do you reply?",
    // TODO: confirm the reply time you're comfortable promising.
    answer:
      "I usually reply within one to two working days. For anything quick, WhatsApp is the fastest way to reach me.",
    keywords: ["reply", "respond", "response", "fast", "quick", "hear back", "contact you"],
    action: { label: "WhatsApp me", target: "whatsapp" },
  },
];
