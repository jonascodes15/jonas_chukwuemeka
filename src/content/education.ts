/** Education, training and research. Source: CV, cross-checked against the brief. */

export const degree = {
  qualification: "Bachelor of Technology, Biology",
  institution: "Federal University of Technology, Owerri",
  shortName: "FUTO",
  start: "2017",
  end: "2023",
  logo: "/logos/futo.png",
};

export const training: { title: string; provider?: string; date: string; note?: string }[] = [
  // TODO: add the bootcamp provider's name.
  { title: "Data Engineering Bootcamp", date: "2026", note: "In progress" },
  // TODO: confirm the exact course title and month.
  { title: "AI for Biomedical Research", provider: "Helix Biogen Institute", date: "2026" },
  { title: "Hands-on Molecular Biology Training (Laboratory Techniques)", date: "May 2026" },
  { title: "Web Development Bootcamp", provider: "Udemy", date: "2024" },
  { title: "National Youth Service Corps (NYSC)", date: "Oct 2023 to Oct 2024" },
];

export const publication = {
  title:
    "Effects of Slurry Concentration and Co-Digestion on Biogas Yields from Unseeded Phaseolus vulgaris (Bean) Peels Chaff and Unseeded Musa paradisiaca (Plantain) Peels Chaff",
  journal: "GSC Biological and Pharmaceutical Sciences",
  date: "November 2024",
  role: "Co-author",
  contribution:
    "Responsible for hands-on laboratory procedures, experimental data collection and sample processing. Worked with the research team to compile and analyse the raw results.",
  doi: "10.30574/gscbps.2024.29.2.0423",
  href: "https://doi.org/10.30574/gscbps.2024.29.2.0423" as string | null,
};
