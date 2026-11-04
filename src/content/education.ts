/** Education, training and research. Source: CV, cross-checked against the brief. */

export const degree = {
  qualification: "Bachelor of Technology, Biology",
  institution: "Federal University of Technology, Owerri",
  shortName: "FUTO",
  start: "2017",
  end: "2023",
  logo: "/logos/futo.png",
};

export const training: {
  title: string;
  provider?: string;
  date: string;
  note?: string;
  /** Public page where the certificate can be verified. */
  credentialUrl?: string;
}[] = [
  // TODO: add the bootcamp provider's name.
  { title: "Data Engineering Bootcamp", date: "2026", note: "In progress" },
  // Title and date from the certificate (issued via Certifier, Oct 2026).
  {
    title: "Essentials of AI in Life and Biomedical Sciences",
    provider: "Helix Biogen Institute",
    date: "Oct 2026",
    credentialUrl: "https://credsverse.com/credentials/1d9ad8d6-d450-4aa5-b4d8-11cc13e3fb7f",
  },
  // From the certificate: a 3-day training held 28 to 30 May 2026.
  {
    title: "Hands-on Molecular Biology Training (Laboratory Techniques)",
    provider: "Helix Biogen Institute",
    date: "May 2026",
    credentialUrl: "https://credsverse.com/credentials/56211f6a-b6da-4b0a-9a66-74601ac01308",
  },
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
