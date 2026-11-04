/**
 * Ids of the homepage sections other code links to. They match the nav labels ("Projects",
 * "Data & Research"). A hyphen stands in for "&", which chat apps and link parsers often treat
 * as the end of the address.
 */
export const SECTION_IDS = {
  projects: "projects",
  data: "data-and-research",
} as const;

/** What the sections were called before 4 Nov 2026, still in links people have shared. */
const LEGACY_IDS: Record<string, string> = {
  work: SECTION_IDS.projects,
  data: SECTION_IDS.data,
};

/** The current id for a hash target, so an old "#work" or "#data" still finds its section. */
export function currentSectionId(id: string) {
  return LEGACY_IDS[id] ?? id;
}

/** "/#work" becomes "/#projects"; any other href is returned unchanged. */
export function currentSectionHref(href: string) {
  const match = /^\/#(.+)$/.exec(href);
  return match ? `/#${currentSectionId(match[1])}` : href;
}
