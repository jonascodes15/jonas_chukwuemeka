import { PageTransition } from "@/components/motion/page-transition";
import { About } from "@/components/sections/about/about";
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
        <Hero />
        <TechMarquee />
        <Work />
        <DataLab />
        <Experience />
        <About />
        <Newsletter heading={site.newsletter.heading} body={site.newsletter.body} />
        <Contact />
      </div>
    </PageTransition>
  );
}
