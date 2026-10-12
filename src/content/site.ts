import type { NavLink } from "./types";

/**
 * Core identity and copy for the whole site.
 * Edit this file to change the hero, About text, contact details and CTA wording.
 * Writing rule: no em dashes anywhere in site copy.
 */

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jonaschukwuemeka.com",

  name: "Jonas Chukwuemeka",
  fullName: "Jonas Chukwuemeka Kingsley",
  nickname: "Jay",
  role: "Founder and full-stack developer",
  location: "Lagos, Nigeria",

  // Shown publicly as the "Email me" link. Enquiry notifications go to CONTACT_TO_EMAIL.
  email: "jonas@weblanda.com",

  whatsapp: {
    // International format, digits only. Can be overridden with NEXT_PUBLIC_WHATSAPP_NUMBER.
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348069195852",
    greeting: "Hi Jay, I found you through your website and I'd like to talk.",
  },

  // /cv serves the CV uploaded in the dashboard (/admin/cv), or public/cv/Jonas-Chukwuemeka-CV.pdf
  // when none is uploaded. TODO: that bundled PDF still lists the old X handle (x.com/jonas_codes).
  cv: {
    href: "/cv",
    fileName: "Jonas-Chukwuemeka-CV.pdf",
  },

  calLink: process.env.NEXT_PUBLIC_CAL_LINK ?? null,

  seo: {
    title: "Jonas Chukwuemeka | Founder and full-stack developer in Lagos",
    description:
      "I build web apps and online stores for businesses. Founder of Weblanda, full-stack developer and biologist growing into data engineering.",
  },

  hero: {
    headline: "I build web apps and online stores for businesses.",
    // Words in the headline that get the lime highlight. Must appear in `headline` exactly.
    highlight: "online stores",
    subline: "Founder of Weblanda. Biologist in tech.",
    supporting:
      "I build end to end, from the first product decision to the database, the checkout and the payment that lands in your account. My training as a biologist shapes how I work with data: measured carefully, tested properly and understood before it ships.",
    primaryCta: { label: "See my work", target: "work" },
    secondaryCta: { label: "Get in touch", target: "contact" },
  },

  about: {
    paragraphs: [
      "I build software that helps businesses work better. I'm the founder of Weblanda, an e-commerce platform for Nigerian small businesses, and I also build custom web apps for businesses that need something made from scratch.",
      "My background is in biology. I hold a degree from FUTO Owerri and I'm a co-author on a peer-reviewed research publication. That training shapes how I build: clean data, careful testing, and understanding how things actually work before I call them done.",
      "I'm growing my skills in data engineering, with a strong interest in biological and health data. I use AI tools to build faster, and I make sure I understand every part of what I ship.",
    ],
  },

  contact: {
    heading: "Have a project, role or research opportunity in mind? Let's talk.",
    intro:
      "Whether you need a store or web app built, are hiring, or want to collaborate on research, send a message and I'll get back to you.",
    enquiryTypes: ["Project", "Job or role", "Research or academic", "Collaboration", "Other"],
    // TODO: confirm budget ranges and currency.
    budgetRanges: [
      "Under ₦500,000",
      "₦500,000 to ₦1,500,000",
      "₦1,500,000 to ₦3,000,000",
      "Above ₦3,000,000",
      "Not sure yet",
    ],
  },

  newsletter: {
    heading: "Notes from the build",
    body: "Occasional notes on what I'm building and learning. No spam.",
  },

  footer: {
    signOff: "Building useful things from Lagos, one shipped product at a time.",
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Work", id: "work" },
  { label: "Data", id: "data" },
  { label: "Experience", id: "experience" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

export function whatsappHref(message: string = site.whatsapp.greeting) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
