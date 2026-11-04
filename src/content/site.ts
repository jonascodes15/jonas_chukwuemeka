import type { NavLink } from "./types";

/**
 * Core identity and copy for the whole site.
 * Edit this file to change the hero, About text, contact details and CTA wording.
 * Writing rule: no em dashes anywhere in site copy.
 */

/** Accepts a full URL or a cal.com path such as "jonaschukwuemeka/introcall". */
function calUrl(link: string | undefined) {
  const value = link?.trim();
  if (!value) return null;
  return /^https?:\/\//.test(value) ? value : `https://cal.com/${value.replace(/^\/+/, "")}`;
}

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

  // Full booking URL, or null when NEXT_PUBLIC_CAL_LINK is unset (the "Book a call" links hide).
  calLink: calUrl(process.env.NEXT_PUBLIC_CAL_LINK),

  seo: {
    title: "Jonas Chukwuemeka | Founder and full-stack developer",
    description:
      "I help founders and businesses turn ideas into launched products. Web apps and online stores, built end to end.",
  },

  hero: {
    headline: "I help founders and businesses turn ideas into launched products.",
    // Words in the headline that get the lime highlight. Must appear in `headline` exactly.
    highlight: "launched products",
    supporting:
      "Web apps and online stores, built end to end, from the first product decision to the payment that lands in your account.",
    primaryCta: { label: "See my work", target: "work" },
    secondaryCta: { label: "Get in touch", target: "contact" },
  },

  // The story follows Jay's LinkedIn About (Nov 2026), reworded for the site.
  about: {
    eyebrow: "Who I am",
    lead: "About",
    trail: "Me",
    intro:
      "Biologist by training, builder by choice. Here's the longer version, and a few things I do away from the keyboard.",
    paragraphs: [
      "I'm Jonas Chukwuemeka, though most people call me Jay. I studied Biology at the Federal University of Technology, Owerri (FUTO), and the part of that training that stayed with me is the part I still enjoy most: taking a problem apart until I understand it, then building something that solves it.",
      "Today I'm a full-stack developer and the founder of Weblanda, a platform that gives small businesses their own online store with real checkout, delivery and a seller dashboard they can run from their phone. I built it end to end on Next.js, Supabase and Vercel, and set up payments with Paystack subaccounts, so every sale goes straight to the seller and Weblanda takes no cut. I also built Formtified, an AI tool that turns a short brief into a ready-to-share client onboarding form.",
      "Alongside the web work, I build data pipelines that move data end to end: streaming with Kafka, orchestration with Airflow, and storage in PostgreSQL and TimescaleDB, packaged with Docker. Two of those projects, BioStreamer and AgroPulse, grew out of my biology background and a peer-reviewed study I co-authored. That research is where I learned to handle data carefully and test it before I trust it.",
      "I build things that go live, and I make sure I understand every part of what I ship. I'm open to new projects, and to roles in web and data engineering.",
    ],
    facts: [
      { label: "Goes by", value: "Jay" },
      { label: "Based in", value: "Lagos, Nigeria" },
      { label: "Studied", value: "Biology at FUTO" },
      { label: "Building", value: "Weblanda" },
    ],
    interestsTitle: "Away from the keyboard",
    // TODO: written from Jay's notes (problem solving, nature, Scrabble); Jay to reword freely.
    interests: [
      {
        key: "problems",
        title: "Solving problems",
        body: "Give me a problem without an obvious answer yet. Working it out is the part of building I enjoy most.",
      },
      {
        key: "nature",
        title: "Exploring nature",
        body: "The biologist in me never switched off. Getting outdoors and exploring is how I reset.",
      },
      {
        key: "scrabble",
        title: "Playing Scrabble",
        body: "Finding the best word in a rack of seven tiles is the kind of puzzle I never get tired of.",
      },
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

  // Posts themselves are written in the dashboard (/admin/blog); this is the copy around them.
  blog: {
    eyebrow: "Blog",
    lead: "Notes from",
    trail: "the build",
    description:
      "Writing on building products for the web, the tools behind them, and what I'm learning in data engineering.",
    seoDescription:
      "Articles by Jonas Chukwuemeka on building web apps and online stores, full-stack development and data engineering.",
    home: {
      lead: "Latest",
      trail: "Writing",
      description: "Notes on what I'm building, how it works, and what I learn along the way.",
    },
    empty: {
      title: "The first posts are on the way.",
      body: "Subscribe below and the first one will land in your inbox.",
    },
    authorBio:
      "Full-stack developer and founder of Weblanda. I build web apps and online stores from Lagos, and I'm growing into data engineering.",
  },

  newsletter: {
    heading: "Notes from the build",
    body: "Occasional notes on what I'm building and learning. No spam.",
  },

  footer: {
    signOff: "Building useful things from Lagos, one shipped product at a time.",
    /** Credit for the Framer template the look was inspired by. Nothing from it is used directly.
     *  Hidden for now; set `show` to true to put the line back under the copyright. */
    credit: {
      show: false as boolean,
      template: "Sawad",
      author: "Mejed Alkoutaini",
      href: "https://www.framer.com/marketplace/templates/sawad/",
    },
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Work", id: "work" },
  { label: "Data", id: "data" },
  { label: "Experience", id: "experience" },
  { label: "About", id: "about" },
  // A page of its own; the homepage's latest-posts section has the same id for the active state.
  { label: "Blog", id: "blog", href: "/blog" },
  { label: "Contact", id: "contact" },
];

/** Where a nav link goes: its own page, or its section on the homepage. */
export const navHref = (link: NavLink) => link.href ?? `/#${link.id}`;

export function whatsappHref(message: string = site.whatsapp.greeting) {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
