import { Suspense } from "react";
import { Tracker } from "@/components/analytics/tracker";
import { BookingLinks } from "@/components/booking/booking-links";
import { Floating } from "@/components/chat/floating";
import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { SectionLinks } from "@/components/layout/section-links";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-pill bg-accent px-4 py-2 font-medium text-accent-contrast focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      {/* Focus target for "Back to top". */}
      <div id="top" tabIndex={-1} className="outline-none" />
      <Nav />
      <main id="main" className="pt-16 md:pt-18">
        {children}
      </main>
      <Footer />
      <Tracker />
      <SectionLinks />
      <BookingLinks />
      <Suspense fallback={null}>
        <Floating />
      </Suspense>
    </>
  );
}
