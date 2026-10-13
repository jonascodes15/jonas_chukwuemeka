import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { caseStudyEntries, getCaseStudy } from "@/content/work";
import { logoImage, og, OG_SIZE, OgFrame, OgMark, ogFonts, siteHost } from "@/lib/og";

/** One share image per case study: the project's name, tagline, logo and main tools. */

export const alt = `A case study by ${site.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudyEntries.map((e) => ({ slug: e.project.slug }));
}

// Logos are read once at build time, like the fonts in src/lib/og.tsx.
const logos = new Map(
  await Promise.all(
    caseStudyEntries
      .filter((e) => e.project.logo)
      .map(async (e) => [e.project.slug, await logoImage(e.project.logo!)] as const),
  ),
);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getCaseStudy((await params).slug);
  if (!entry) return new Response("Not found", { status: 404 });
  const { project, section } = entry;

  const logo = logos.get(project.slug);
  // Long names step down so they stay on one or two lines.
  const nameSize = project.name.length > 16 ? 80 : project.name.length > 10 ? 104 : 128;

  return new ImageResponse(
    <OgFrame>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "64px 72px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- next/og draws with <img>, not next/image.
            <img
              src={logo}
              alt=""
              width={56}
              height={56}
              style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover" }}
            />
          ) : (
            <OgMark size={52} />
          )}
          <div
            style={{
              display: "flex",
              fontFamily: "GeistMono",
              fontSize: 20,
              letterSpacing: 3.5,
              textTransform: "uppercase",
              color: og.muted,
            }}
          >
            {section === "data" ? "Case study · Data" : "Case study"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 48,
            maxWidth: 1000,
            fontFamily: "Bricolage",
            fontSize: nameSize,
            lineHeight: 0.95,
            letterSpacing: -4,
            textTransform: "uppercase",
          }}
        >
          {project.name}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 900,
            fontSize: 34,
            lineHeight: 1.3,
            color: og.muted,
          }}
        >
          {project.tagline}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 760 }}>
            {project.stack.slice(0, 4).map((tech) => (
              <div
                key={tech}
                style={{
                  display: "flex",
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: `1px solid ${og.border}`,
                  backgroundColor: og.surface,
                  fontFamily: "GeistMono",
                  fontSize: 18,
                  color: og.muted,
                }}
              >
                {tech}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 500 }}>{site.name}</span>
            <span style={{ fontFamily: "GeistMono", fontSize: 18, color: og.accent }}>{siteHost()}</span>
          </div>
        </div>
      </div>
    </OgFrame>,
    { ...size, fonts: ogFonts },
  );
}
