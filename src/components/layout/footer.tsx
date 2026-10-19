import { cacheLife } from "next/cache";
import Link from "next/link";
import { navHref, navLinks, site } from "@/content/site";
import { activeSocials } from "@/content/socials";
import { SocialIcon } from "@/components/icons/social-icon";
import { BackToTop } from "./back-to-top";
import { Logo } from "./logo";

/** Cached for a day so the static shell stays prerendered while the year stays current. */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border">
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-muted">{site.footer.signOff}</p>
            <ul className="mt-6 flex gap-2.5">
              {activeSocials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:bg-accent hover:text-accent-contrast"
                  >
                    <SocialIcon name={s.key} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Explore</h2>
            <ul className="mt-4 grid gap-2.5">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <Link href={navHref(l)} className="text-fg/85 transition-colors hover:text-accent-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Reach me</h2>
            <ul className="mt-4 grid gap-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-fg/85 transition-colors hover:text-accent-ink"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.cv.href}
                  download={site.cv.fileName}
                  className="text-fg/85 transition-colors hover:text-accent-ink"
                >
                  Download CV
                </a>
              </li>
              <li className="text-muted">{site.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-border pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-muted">
              © <CurrentYear /> {site.fullName}. All rights reserved.
            </p>
            {site.footer.credit.show && (
              <p className="mt-1.5 text-[0.7rem] text-muted">
                Design inspired by{" "}
                <a
                  href={site.footer.credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border-strong underline-offset-2 transition-colors hover:text-accent-ink hover:decoration-current"
                >
                  {site.footer.credit.template}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{" "}
                by {site.footer.credit.author}
              </p>
            )}
          </div>
          <BackToTop />
        </div>
      </div>

      {/* Oversized name as a quiet sign-off. Decorative only, so it's drawn by CSS rather than
          being text that screen readers or contrast checks would treat as content. */}
      <div
        aria-hidden
        className="pointer-events-none -mb-[0.18em] text-center font-display text-[13.5vw] leading-none font-extrabold tracking-[-0.05em] text-surface-2 uppercase select-none before:content-['Chukwuemeka']"
      />
    </footer>
  );
}
