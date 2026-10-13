import type { ExperienceItem } from "./types";

/**
 * Work experience, newest first.
 * Source of truth: Section 7 of the brief (from LinkedIn). CV detail is only used where it agrees.
 * The Web3 Community Manager role on the CV is intentionally left out.
 */
export const experience: ExperienceItem[] = [
  {
    title: "Founder",
    organisation: "Weblanda",
    type: "Self-employed",
    start: "2026-07",
    end: null,
    location: "Lagos State, Nigeria",
    workplace: "On-site",
    logo: "/logos/weblanda-mark.jpg",
    summary:
      "Founded and built Weblanda, a multi-tenant e-commerce platform that gives Nigerian small businesses real online stores with checkout, delivery and a seller dashboard, all manageable from a phone.",
    details: [
      "Built the full platform solo on Next.js, Supabase (PostgreSQL) and Vercel, with each seller's store running on its own subdomain.",
      "Integrated Paystack subaccounts so sellers are paid directly into their own accounts, with no platform cut on sales.",
      "Onboarded the first sellers across fashion, handmade accessories, furniture and gadgets, and set up their storefronts.",
      "Registered the company, Weblanda Technologies Ltd, and handled brand, content and distribution end to end.",
    ],
    skills: ["Supabase", "PostgreSQL", "Next.js", "Payment Integration", "Product Development"],
  },
  {
    title: "Web Development Intern",
    organisation: "tippified",
    orgNote: "owned by Grundex Limited",
    type: "Internship",
    start: "2025-06",
    end: "2026-06",
    location: "Lagos State, Nigeria",
    workplace: "Hybrid",
    logo: "/logos/tippified.jpg",
    summary:
      "Full-stack feature development: built and maintained responsive web application components in React, with Node.js backend services and MySQL.",
    details: [
      "Developed and maintained responsive web application components with React, JavaScript, HTML5 and CSS3 on the front end, and Node.js and Express on the back end.",
      "Designed and integrated RESTful APIs and managed relational database schemas in MySQL and PostgreSQL for smooth client-server data flow.",
      "Built mobile-first, cross-browser interfaces and managed code with Git and GitHub.",
      "Deployed on Vercel, Render and Netlify, and worked with senior developers to debug issues and improve performance.",
    ],
    skills: ["MySQL", "JavaScript", "React", "Node.js", "HTML5", "CSS3"],
  },
  {
    title: "Research Assistant",
    organisation: "FeedNutr Limited",
    start: "2024-10",
    end: "2025-07",
    location: "Ogun State, Nigeria",
    logo: "/logos/feednutr.jpg",
    summary:
      "Organic fertiliser production research. Supported Black Soldier Fly (BSF) colony rearing, data collection and technical research.",
    details: [
      "Supported daily operational management of BSF larvae colony production, including feeding schedules and environmental control.",
      "Prepared substrate from local organic waste streams, such as agricultural by-products and plantain and bean peels, to improve larval growth and bioconversion efficiency.",
      "Logged daily biomass yield, bioconversion rates and feed-intake metrics.",
      "Maintained hygiene, biosecurity and sanitation protocols across rearing modules and lab equipment.",
    ],
    skills: ["Technical Research", "Data Collection", "Laboratory Techniques"],
  },
  {
    title: "Students' Union Director of Welfare",
    organisation: "Federal University of Technology Owerri",
    type: "Elected by student vote",
    start: "2019-09",
    end: "2021-03",
    location: "Imo State, Nigeria",
    logo: "/logos/futo.png",
    summary:
      "Started and led a joint task force that cleared expired food, drinks and other consumables from shops across the FUTO community after the COVID-19 break, protecting students returning to campus.",
    details: [
      "Started a food safety initiative and led a joint task force of the Directorate of Welfare task force and the Man O' War FUTO Command, with the support of the Dean of Student Affairs, Prof. C.E. Orji, and university management.",
      "Inspected shops and vendors across the FUTO community and removed expired food items, drinks and eatables after the COVID-19 break and during long session breaks.",
      "Worked with the Rotaract Club of FUTO (District 9142) to run free on-campus health screening and wellness awareness for students.",
      "Led a campus-wide cleanup and hygiene sensitisation campaign.",
      "Managed welfare budgeting and logistics, and resolved student grievances directly with university management.",
    ],
    skills: ["Team Collaboration", "Student Leadership", "Public Health"],
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-07" -> "Jul 2026" */
export function formatMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function formatRange(start: string, end: string | null) {
  return `${formatMonth(start)} to ${end ? formatMonth(end) : "Present"}`;
}
