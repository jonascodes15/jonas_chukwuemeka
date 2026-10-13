import { ArrowUpRight, CalendarDays, Download, Mail } from "lucide-react";
import type { ComponentType } from "react";
import { SocialIcon } from "@/components/icons/social-icon";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { SectionHeading } from "@/components/ui/section-heading";
import { site, whatsappHref } from "@/content/site";
import { activeSocials } from "@/content/socials";
import { ContactForm } from "./contact-form";

function WhatsAppIcon({ className }: { className?: string }) {
  return <SocialIcon name="whatsapp" className={className} />;
}

/** "2348069195852" -> "+234 806 919 5852" */
function formatPhone(n: string) {
  const m = n.match(/^(\d{3})(\d{3})(\d{3})(\d+)$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${n}`;
}

export function Contact() {
  const channels: {
    href: string;
    title: string;
    detail: string;
    icon: ComponentType<{ className?: string }>;
    external?: boolean;
    download?: string;
  }[] = [
    ...(site.calLink
      ? [
          {
            href: site.calLink,
            title: "Book a call",
            detail: "Pick a time that suits you",
            icon: CalendarDays,
            external: true,
          },
        ]
      : []),
    {
      href: whatsappHref(),
      title: "WhatsApp",
      detail: formatPhone(site.whatsapp.number),
      icon: WhatsAppIcon,
      external: true,
    },
    { href: `mailto:${site.email}`, title: "Email", detail: site.email, icon: Mail },
    { href: site.cv.href, title: "Download CV", detail: "PDF", icon: Download, download: site.cv.fileName },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden py-24 md:py-32"
    >
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/2 -z-10 size-[44rem] -translate-x-1/2 rounded-full bg-accent-glow blur-3xl"
      />
      <div className="container-page">
        <SectionHeading
          id="contact-title"
          eyebrow="Contact"
          lead="Start a"
          trail="Conversation"
          description={site.contact.heading}
        />

        <div className="mt-14 grid gap-6 md:mt-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          <div className="flex flex-col gap-6">
            <Reveal>
              <p className="text-lg leading-relaxed text-muted">{site.contact.intro}</p>
            </Reveal>

            <RevealGroup as="ul" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {channels.map((c) => {
                const Icon = c.icon;
                return (
                  <RevealItem as="li" key={c.title}>
                    <a
                      href={c.href}
                      {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      {...(c.download ? { download: c.download } : {})}
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong"
                    >
                      <span
                        aria-hidden
                        className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-fg transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-contrast"
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-fg">{c.title}</span>
                        <span className="block truncate text-sm text-muted">{c.detail}</span>
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
                      />
                      {c.external && <span className="sr-only">(opens in a new tab)</span>}
                    </a>
                  </RevealItem>
                );
              })}
            </RevealGroup>

            <Reveal className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted">Or find me on</p>
              <ul className="flex gap-2">
                {activeSocials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in a new tab)`}
                      className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-fg hover:text-fg"
                    >
                      <SocialIcon name={s.key} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <Spotlight className="rounded-card border border-border bg-surface p-6 sm:p-8 lg:p-10">
              <h3 className="mb-6 font-display text-2xl font-bold tracking-tight text-fg">Send a message</h3>
              <ContactForm
                enquiryTypes={site.contact.enquiryTypes}
                budgetRanges={site.contact.budgetRanges}
              />
            </Spotlight>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
