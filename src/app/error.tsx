"use client";

import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

const RELOAD_KEY = "jc:reloaded-after-deploy";

/**
 * After a new deployment, a tab opened before it can call a server action (a form submit)
 * that no longer exists on the server. A fresh page load fixes that, so this boundary
 * reloads once automatically. Anything else shows a retry screen.
 */
function isStaleDeployment(error: Error) {
  return (
    error.name === "UnrecognizedActionError" ||
    /Server Action .* was not found|failed-to-find-server-action/i.test(error.message)
  );
}

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const stale = isStaleDeployment(error);

  useEffect(() => {
    if (!stale) {
      console.error(error);
      return;
    }
    try {
      // At most one automatic reload per minute, so a real problem can't cause a reload loop.
      const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
      if (Date.now() - last < 60_000) return;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      // Storage blocked: still reload once; the user can retry by hand after that.
    }
    window.location.reload();
  }, [error, stale]);

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg">
          {stale ? "The site was just updated" : "Something went wrong"}
        </h1>
        <p className="mt-3 text-muted">
          {stale
            ? "Reloading the page to get the latest version. If nothing happens, reload it yourself."
            : "Sorry about that. Try again, and if it keeps happening, go back to the homepage."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => (stale ? window.location.reload() : retry())}>
            <RotateCw aria-hidden className="size-4" />
            {stale ? "Reload" : "Try again"}
          </Button>
          <ButtonLink href="/" variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
