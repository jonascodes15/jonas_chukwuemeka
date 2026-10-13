import { degree, publication } from "@/content/education";
import { site } from "@/content/site";
import { activeSocials } from "@/content/socials";
import type { CaseStudyEntry } from "@/content/work";

/**
 * Structured data (schema.org JSON-LD) that tells search engines who this site is about and what
 * each case study is. Check it with https://validator.schema.org or Google's Rich Results Test.
 */

const abs = (path: string) => new URL(path, site.url).toString();
const PERSON_ID = `${site.url}/#person`;

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    alternateName: [site.fullName, site.nickname],
    url: site.url,
    image: abs("/images/me.jpg"),
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    worksFor: { "@type": "Organization", name: "Weblanda", url: "https://weblanda.com" },
    alumniOf: { "@type": "CollegeOrUniversity", name: degree.institution },
    knowsAbout: [
      "Web development",
      "E-commerce",
      "Next.js",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Data engineering",
      "Biology",
    ],
    sameAs: activeSocials.map((s) => s.href),
    ...(publication.href && {
      subjectOf: {
        "@type": "ScholarlyArticle",
        name: publication.title,
        url: publication.href,
        isPartOf: { "@type": "Periodical", name: publication.journal },
      },
    }),
  };
}

export function homeSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(),
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.seo.description,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
    ],
  };
}

export function caseStudySchema({ project }: CaseStudyEntry) {
  const url = abs(`/work/${project.slug}`);
  const live = project.links.find((l) => l.kind === "live" && l.href)?.href;
  const code = project.links.find((l) => l.kind === "github" && l.href)?.href;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#case-study`,
    name: `${project.name} case study`,
    headline: project.name,
    description: project.summary,
    url,
    inLanguage: "en",
    author: { "@type": "Person", "@id": PERSON_ID, name: site.name, url: site.url },
    keywords: project.stack.join(", "),
    about: {
      "@type": code && !live ? "SoftwareSourceCode" : "SoftwareApplication",
      name: project.name,
      ...(live && { url: live }),
      ...(code && { codeRepository: code }),
    },
  };
}

/** Renders a JSON-LD block. `<` is escaped so text can never close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
