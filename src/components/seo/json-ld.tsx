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

type SchemaPost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  coverImage: string | null;
  wordCount?: number;
  seoDescription?: string | null;
};

const author = () => ({ "@type": "Person", "@id": PERSON_ID, name: site.name, url: site.url });

export function blogSchema(posts: SchemaPost[]) {
  const url = abs("/blog");
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: `${site.name}'s blog`,
    description: site.blog.seoDescription,
    inLanguage: "en",
    author: author(),
    publisher: { "@id": PERSON_ID },
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: abs(`/blog/${p.slug}`),
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
    })),
  };
}

export function blogPostingSchema(post: SchemaPost) {
  const url = abs(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        mainEntityOfPage: url,
        url,
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        // The generated share image always exists; a cover photo comes first when there is one.
        image: [...(post.coverImage ? [abs(post.coverImage)] : []), `${url}/opengraph-image`],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        inLanguage: "en",
        keywords: post.tags.join(", ") || undefined,
        wordCount: post.wordCount,
        author: author(),
        publisher: { "@id": PERSON_ID },
        isPartOf: { "@id": `${abs("/blog")}#blog` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: abs("/blog") },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
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
