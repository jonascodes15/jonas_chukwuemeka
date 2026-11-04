import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="container-page flex min-h-[80dvh] flex-col justify-center pt-28 pb-16">
        <p className="font-mono text-sm tracking-[0.18em] text-muted uppercase">Error 404</p>
        <h1 className="mt-4 font-display text-section font-extrabold uppercase">
          <span className="block">Nothing</span>
          <span className="block text-ghost">Built here yet</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved. The work you came for is one click
          away.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" size="lg">
            Back to home
          </ButtonLink>
          <ButtonLink href="/#projects" size="lg" variant="secondary">
            See my work
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
