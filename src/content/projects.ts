import { caseStudies } from "./caseStudies";
import type { Project, Screenshot, Store } from "./types";

/**
 * Product work shown in the Work section and on /work/[slug].
 * Screenshots are pre-optimised AVIF/WebP files; see `Screenshot` in ./types for the naming.
 * Case-study copy lives in ./caseStudies.
 */

const WEBLANDA_WIDTHS = [400, 560, 800, 1024];
// Titles, captions and alt text are the wording weblanda.com uses.
const weblandaPhone = (name: string, title: string, caption: string, alt: string): Screenshot => ({
  dir: "/projects/weblanda",
  name,
  widths: WEBLANDA_WIDTHS,
  width: 1290,
  height: 2796,
  alt,
  title,
  caption,
  device: "phone",
});

const FORMTIFIED_DESKTOP = [400, 560, 800, 1024, 1440, 1920];
const formtifiedDesktop = (name: string, alt: string, caption: string): Screenshot => ({
  dir: "/projects/formtified",
  name,
  widths: FORMTIFIED_DESKTOP,
  width: 2880,
  height: 1800,
  alt,
  caption,
  device: "desktop",
});
const formtifiedPhone = (name: string, alt: string, caption: string): Screenshot => ({
  dir: "/projects/formtified",
  name,
  widths: [400, 560, 800],
  width: 1170,
  height: 2532,
  alt,
  caption,
  device: "phone",
});

export const projects: Project[] = [
  {
    slug: "weblanda",
    name: "Weblanda",
    tagline: "Online stores for Nigerian small businesses, run entirely from a phone.",
    summary:
      "A multi-tenant SaaS e-commerce platform that gives Nigerian small businesses their own online store, with real checkout, delivery and a seller dashboard, all manageable from a phone. Every store runs on its own subdomain.",
    highlights: [
      "Sellers are paid directly into their own Paystack subaccounts. Money never passes through Weblanda.",
      "Weblanda takes no cut of sales.",
      "Built solo: product, engineering, payments, brand and content.",
    ],
    stack: [
      "Next.js (App Router)",
      "Supabase (PostgreSQL)",
      "Vercel",
      "Wildcard subdomains",
      "Paystack subaccounts",
    ],
    links: [
      { label: "Visit Weblanda", href: "https://weblanda.com", kind: "live" },
      { label: "Weblanda on X", href: "https://x.com/weblanda", kind: "x" },
      {
        label: "Weblanda on LinkedIn",
        href: "https://www.linkedin.com/company/weblanda-hq/",
        kind: "linkedin",
      },
      { label: "Weblanda on Facebook", href: "https://www.facebook.com/weblanda/", kind: "facebook" },
    ],
    // All Weblanda screens show a demo shop ("Jane's" thrift shop) with demo figures. Say so wherever they appear.
    screenshots: [
      {
        dir: "/projects/weblanda",
        name: "analytics-desktop",
        widths: WEBLANDA_WIDTHS,
        width: 1500,
        height: 950,
        alt: "Weblanda's Analytics page on a desktop, showing a month of sales",
        caption: "Sales, orders, products, customers and marketing, on one date range.",
        device: "desktop",
      },
      weblandaPhone(
        "screen-overview",
        "See how your shop is doing",
        "Revenue, orders and shop visits, all on one screen.",
        "The dashboard overview: revenue, a week of sales and best-selling items",
      ),
      weblandaPhone(
        "screen-start",
        "Open your shop in minutes",
        "Pick a name and your shop is live, free for 14 days.",
        "Weblanda's first step on a phone: naming a new shop",
      ),
      weblandaPhone(
        "screen-add-product",
        "Add products from your phone",
        "A photo, a name and a price, and it's in your shop.",
        "The Add a product screen, with a photo of a white T-shirt",
      ),
      weblandaPhone(
        "screen-orders",
        "Every order in one place",
        "See who bought what, and which orders are paid.",
        "The Orders screen listing recent paid orders",
      ),
      weblandaPhone(
        "screen-inventory",
        "Know what's running low",
        "Stock updates as you sell, and low items are flagged before they run out.",
        "The Inventory screen, with two items marked as running low",
      ),
      weblandaPhone(
        "screen-customers",
        "Know who buys from you",
        "Every customer, what they've spent and when they last ordered.",
        "The Customers screen, most valuable customers first",
      ),
      {
        dir: "/projects/weblanda",
        name: "analytics-mobile",
        widths: WEBLANDA_WIDTHS,
        width: 480,
        height: 900,
        alt: "Weblanda's Analytics page on a phone",
        caption: "Sales, orders, products, customers and marketing, on one date range.",
        device: "phone",
      },
    ],
    logo: "/logos/weblanda-mark.jpg",
    caseStudy: caseStudies.weblanda,
  },
  {
    slug: "formtified",
    name: "Formtified",
    tagline: "AI onboarding forms for freelancers and creators.",
    summary:
      "A creator describes a client's project in a sentence. The AI asks a few clarifying questions, then builds a complete onboarding form with a share link. The client fills it in on their phone, and every response lands in the creator's dashboard.",
    highlights: [
      "Tailored forms generated from one sentence and a few follow-up questions.",
      "Share links built for WhatsApp, a full form editor, responses with CSV export, and a credit system.",
      "An admin dashboard for users, subscribers, forms, site visits and announcements.",
    ],
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "Motion",
      "Neon Postgres",
      "JWT auth (jose, bcrypt)",
      "OpenAI-compatible AI API",
      "Resend",
      "Vercel",
    ],
    links: [
      { label: "Live app", href: "https://www.formtified.com", kind: "live" },
      { label: "How it's built", href: "https://github.com/jonascodes15/formtified", kind: "github" },
      { label: "Formtified on X", href: "https://x.com/Formtified", kind: "x" },
    ],
    // All names, emails and figures in these screens are fictional demo data.
    screenshots: [
      formtifiedDesktop(
        "landing-hero",
        "Formtified's landing page: Know exactly what your client wants to build",
        "The pitch, the primary call to action and a live product preview.",
      ),
      formtifiedDesktop(
        "generate-done",
        "Formtified's AI generator after three quick questions, with the finished form and its share link",
        "The finished form with a share link, WhatsApp sharing and edit buttons.",
      ),
      formtifiedDesktop(
        "dashboard",
        "The creator dashboard: generate a form with AI, start from a template or add credits",
        "Every form a creator owns, with quick actions and credits left.",
      ),
      formtifiedDesktop(
        "form-editor",
        "The form editor, with sections, question types and a share panel",
        "Edit every question: reorder, change type, mark as required, add options.",
      ),
      formtifiedDesktop(
        "admin-overview",
        "The admin overview with user, form and visitor charts and system status",
        "Platform health at a glance: users, subscribers, forms, responses, visits and system status.",
      ),
      formtifiedPhone(
        "mobile-client-form",
        "A client filling in an onboarding form on a phone, with a progress bar",
        "A client filling the form; the progress bar tracks required answers.",
      ),
      formtifiedPhone(
        "mobile-generate-done",
        "The AI generator on a phone, with the finished form ready to share",
        "The finished form with a share link, WhatsApp sharing and edit buttons.",
      ),
      formtifiedPhone(
        "mobile-landing-hero",
        "Formtified's landing page on a phone",
        "The pitch, the primary call to action and a live product preview.",
      ),
    ],
    logo: "/logos/formtified-mark.png",
    caseStudy: caseStudies.formtified,
  },
];

export const stores: Store[] = [
  {
    name: "Veek3Footies",
    description: "Premium handmade sandals, slides and mules.",
    href: "https://veek3footies.weblanda.shop",
    logo: {
      src: "/logos/stores/veek3footies",
      width: 875,
      height: 530,
      widths: [400, 560],
      background: "#f7f8f9",
    },
  },
  {
    name: "JaneluxBeads",
    description: "Handcrafted beaded bags and statement jewellery.",
    href: "https://janeluxbeads.weblanda.shop",
    logo: {
      src: "/logos/stores/janeluxbeads",
      width: 200,
      height: 217,
      widths: [200],
      background: "#1c1c1c",
    },
  },
  {
    name: "JBOSS Furnitures",
    description: "Furniture craftsmanship.",
    href: "https://jbossfurnitures.weblanda.shop",
    logo: {
      src: "/logos/stores/jboss-furnitures",
      width: 199,
      height: 127,
      widths: [199],
      background: "#eae6de",
    },
  },
  {
    name: "Fashion Spice by Judie",
    description: "Tailored fashion, custom hair bonnets, tote bags and handcrafted resin art.",
    href: "https://fashionspicebyjudie.weblanda.shop",
    logo: {
      src: "/logos/stores/fashionspicebyjudie",
      width: 819,
      height: 498,
      widths: [400, 560],
      background: "#000000",
    },
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
