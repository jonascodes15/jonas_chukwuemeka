import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { og, OG_SIZE, OgFrame, OgMark, ogFonts, ogPhoto, siteHost } from "@/lib/og";

/** The share image for the homepage and any page without its own. Built once at build time. */

export const alt = `${site.name}: ${site.hero.headline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const { headline, highlight } = site.hero;
  // Word by word, with the highlighted phrase kept together, so lines wrap cleanly.
  const [before, after] = headline.split(highlight).map((part) => part.trim().split(/\s+/).filter(Boolean));
  // Punctuation straight after the highlight (no space) rides along unlit, so it can't wrap or gap.
  const tail = /^[^\s\w]+$/.test(after[0] ?? "") && !/^\s/.test(headline.split(highlight)[1]) ? after.shift() : "";
  const words = [
    ...before.map((w) => ({ w, lit: false, tail: "" })),
    { w: highlight, lit: true, tail },
    ...after.map((w) => ({ w, lit: false, tail: "" })),
  ];

  return new ImageResponse(
    <OgFrame>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "64px 0 60px 72px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <OgMark />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 15,
              letterSpacing: 2.6,
              lineHeight: 1.25,
              textTransform: "uppercase",
            }}
          >
            <span style={{ fontWeight: 500 }}>Jonas</span>
            <span>Chukwuemeka</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 16,
            rowGap: 4,
            marginTop: 64,
            maxWidth: 680,
            fontFamily: "Bricolage",
            fontSize: 64,
            lineHeight: 1.04,
            letterSpacing: -2.2,
          }}
        >
          {words.map(({ w, lit, tail }) => (
            <span key={w} style={{ display: "flex" }}>
              <span
                style={
                  lit
                    ? {
                        backgroundColor: og.accent,
                        color: og.accentContrast,
                        padding: "0 12px",
                        margin: "0 -4px",
                        borderRadius: 10,
                      }
                    : {}
                }
              >
                {w}
              </span>
              {tail ? <span style={{ marginLeft: 6 }}>{tail}</span> : null}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontFamily: "GeistMono",
            fontSize: 20,
            color: og.muted,
          }}
        >
          {siteHost()}
        </div>
      </div>

      <div style={{ display: "flex", width: 400, height: "100%", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og draws with <img>, not next/image. */}
        <img
          src={ogPhoto}
          alt=""
          width={400}
          height={630}
          style={{ width: 400, height: 630, objectFit: "cover", objectPosition: "50% 20%" }}
        />
        <div
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, backgroundColor: og.accent }}
        />
      </div>
    </OgFrame>,
    { ...size, fonts: ogFonts },
  );
}
