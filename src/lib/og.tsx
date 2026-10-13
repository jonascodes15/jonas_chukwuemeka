import "server-only";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type { ReactNode } from "react";
import { site } from "@/content/site";

/**
 * Shared pieces for the generated share images (opengraph-image.tsx files).
 * Images are drawn by next/og, which can't read CSS variables, so the dark theme's tokens from
 * globals.css are repeated here. Fonts are static TTFs in assets/fonts (SIL Open Font License).
 */

export const OG_SIZE = { width: 1200, height: 630 };

export const og = {
  bg: "#0e0e0d",
  surface: "#181817",
  border: "#2a2a27",
  fg: "#f4f4ef",
  muted: "#a1a19a",
  ghost: "#64645e",
  accent: "#c6f432",
  accentContrast: "#0e0e0d",
};

// Files are read once, when this module loads at build time, so the images stay static.
// Paths are written out in full so the bundler only ships these files with the server code.
const [display, regular, medium, mono, photo] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/BricolageGrotesque-ExtraBold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-Medium.ttf")),
  readFile(join(process.cwd(), "assets/fonts/GeistMono-Regular.ttf")),
  readFile(join(process.cwd(), "public/images/me.jpg"), "base64"),
]);

export const ogFonts = [
  { name: "Bricolage", data: display, weight: 800 as const, style: "normal" as const },
  { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
  { name: "GeistMono", data: mono, weight: 400 as const, style: "normal" as const },
];

export const ogPhoto = `data:image/jpeg;base64,${photo}`;

/** A logo from public/logos as a data URI, e.g. logoImage("/logos/weblanda-mark.jpg"). */
export async function logoImage(path: string) {
  const file = basename(path);
  const data = await readFile(join(process.cwd(), "public/logos", file), "base64");
  return `data:${file.endsWith(".png") ? "image/png" : "image/jpeg"};base64,${data}`;
}

/** The JC mark, as in src/components/brand/logo-mark.tsx. */
export function OgMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={og.accent} strokeWidth={2}>
      <path d="M8 28.5V4h36v40H8v-3.5" />
      <path d="M8 31v5.25a2.6 2.6 0 0 1-5.2 0" />
      <path d="M18.1 32.4A3.9 3.9 0 1 0 18.1 37.6" />
    </svg>
  );
}

export const siteHost = () => site.url.replace(/^https?:\/\//, "");

/** Dark canvas with the dotted grid and a lime glow, like the site's hero. */
export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: og.bg,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(244,244,239,0.13) 1px, transparent 0)",
        backgroundSize: "28px 28px",
        fontFamily: "Geist",
        color: og.fg,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(198,244,50,0.18) 0%, rgba(198,244,50,0) 45%)",
        }}
      />
      {children}
    </div>
  );
}
