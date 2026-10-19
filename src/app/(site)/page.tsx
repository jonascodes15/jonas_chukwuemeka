import { PageTransition } from "@/components/motion/page-transition";
import { homeSchema, JsonLd } from "@/components/seo/json-ld";
import { About } from "@/components/sections/about/about";
import { LatestPosts } from "@/components/sections/blog/latest-posts";
import { Contact } from "@/components/sections/contact/contact";
import { DataLab } from "@/components/sections/data/data-lab";
import { Experience } from "@/components/sections/experience/experience";
import { Hero } from "@/components/sections/hero/hero";
import { Newsletter } from "@/components/sections/newsletter";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { Work } from "@/components/sections/work/work";
import { site } from "@/content/site";

export default function HomePage() {
  return (
    <PageTransition>
      <div>
        <JsonLd data={homeSchema()} />
        <Hero />
        <TechMarquee />
        <Work />
        <DataLab />
        <Experience />
        <About />
        <LatestPosts />
        <Newsletter heading={site.newsletter.heading} body={site.newsletter.body} />
        <Contact />
      </div>
    </PageTransition>
  );
}
