/**
 * Cal.com's pop-up booking embed, loaded only when someone is about to book.
 * This is Cal's documented vanilla snippet (a command queue that embed.js picks up), written out
 * so the script loads on demand and a failed load can fall back to the plain booking link.
 */

type CalApi = ((...args: unknown[]) => void) & {
  q: unknown[][];
  ns: Record<string, CalApi>;
  loaded?: boolean;
};
type CalWindow = Window & { Cal?: CalApi };

const EMBED_SRC = "https://app.cal.com/embed/embed.js";
const NAMESPACE = "booking";

let state: "idle" | "loading" | "ready" | "failed" = "idle";
let onFail: (() => void) | null = null;

/** "https://cal.com/user/event" -> "user/event". Only cal.com links can use the embed. */
export function calPath(link: string): string | null {
  try {
    const url = new URL(link);
    if (url.hostname !== "cal.com" && url.hostname !== "www.cal.com") return null;
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    return path || null;
  } catch {
    return null;
  }
}

/** The site's own tokens, so the calendar uses the lime accent in both themes. */
function themeVars(theme: "light" | "dark") {
  const probe = document.createElement("div");
  probe.setAttribute("data-theme", theme);
  probe.hidden = true;
  document.body.appendChild(probe);
  const css = getComputedStyle(probe);
  const read = (name: string) => css.getPropertyValue(name).trim();
  const vars =
    theme === "dark"
      ? { "cal-brand": read("--accent"), "cal-brand-text": read("--accent-contrast") }
      : { "cal-brand": read("--accent-ink"), "cal-brand-text": read("--surface") };
  probe.remove();
  return vars;
}

function api(): CalApi {
  const w = window as CalWindow;
  if (!w.Cal) {
    const push = (target: CalApi, args: unknown[]) => target.q.push(args);
    const cal = function (...args: unknown[]) {
      if (!cal.loaded) {
        cal.ns = {};
        cal.loaded = true;
        state = "loading";
        const script = document.createElement("script");
        script.src = EMBED_SRC;
        script.async = true;
        script.onload = () => (state = "ready");
        script.onerror = () => {
          state = "failed";
          onFail?.();
        };
        document.head.appendChild(script);
      }
      if (args[0] === "init" && typeof args[1] === "string") {
        const name = args[1];
        const ns = function (...nsArgs: unknown[]) {
          push(ns, nsArgs);
        } as CalApi;
        ns.q = [];
        cal.ns[name] ??= ns;
        push(cal.ns[name], args);
        push(cal, ["initNamespace", name]);
        return;
      }
      push(cal, args);
    } as CalApi;
    cal.q = [];
    w.Cal = cal;
  }
  return w.Cal;
}

let initialised = false;
function init() {
  if (initialised) return;
  initialised = true;
  const cal = api();
  cal("init", NAMESPACE, { origin: "https://app.cal.com" });
  cal.ns[NAMESPACE]("ui", {
    hideEventTypeDetails: false,
    layout: "month_view",
    cssVarsPerTheme: { light: themeVars("light"), dark: themeVars("dark") },
  });
}

/** Starts downloading the embed ahead of a likely click (hover, focus). */
export function warmUpCal() {
  if (state === "idle") init();
}

/**
 * Opens the booking pop-up. Returns false when the embed can't be used, so the caller lets the
 * link open normally. If the script fails to load after the click, the link opens instead.
 */
export function openCal(link: string): boolean {
  const path = calPath(link);
  if (!path || state === "failed") return false;
  onFail = () => window.location.assign(link);
  init();
  const theme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  api().ns[NAMESPACE]("modal", { calLink: path, config: { layout: "month_view", theme } });
  return true;
}
