import { dataProjects } from "./dataProjects";
import { projects } from "./projects";
import type { CaseStudy, DataProject, Project } from "./types";

export interface CaseStudyEntry {
  project: Project | DataProject;
  caseStudy: CaseStudy;
  /** Homepage section the project lives in, for the "back" link. */
  section: "work" | "data";
}

/** Every project with a case study, in homepage order: product work first, then data. */
export const caseStudyEntries: CaseStudyEntry[] = [
  ...projects.map((project) => ({ project, section: "work" as const })),
  ...dataProjects.map((project) => ({ project, section: "data" as const })),
].flatMap((e) => (e.project.caseStudy ? [{ ...e, caseStudy: e.project.caseStudy }] : []));

export function getCaseStudy(slug: string) {
  const index = caseStudyEntries.findIndex((e) => e.project.slug === slug);
  if (index === -1) return null;
  return {
    ...caseStudyEntries[index],
    index,
    // Wraps around, so the last case study points back to the first.
    next: caseStudyEntries[(index + 1) % caseStudyEntries.length],
  };
}
