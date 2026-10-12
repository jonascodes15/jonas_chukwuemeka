"use client";

import { CheckCircle2, CircleAlert, Loader2, Upload } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadCv, type CvState } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

export function CvUpload({ maxBytes }: { maxBytes: number }) {
  const [state, action, pending] = useActionState<CvState, FormData>(uploadCv, { status: "idle" });
  // Checked here too, so an oversized file never hits the server's request size limit.
  const [tooBig, setTooBig] = useState(false);
  const message = tooBig
    ? { status: "error" as const, message: `That file is over ${maxBytes / 1024 / 1024} MB. Export a smaller PDF.` }
    : state;

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-fg">PDF file</span>
        <input
          type="file"
          name="file"
          accept="application/pdf,.pdf"
          required
          onChange={(e) => {
            const big = (e.currentTarget.files?.[0]?.size ?? 0) > maxBytes;
            setTooBig(big);
            if (big) e.currentTarget.value = "";
          }}
          className="block w-full cursor-pointer rounded-xl border border-border bg-bg text-sm text-muted file:mr-4 file:cursor-pointer file:border-0 file:bg-surface-2 file:px-4 file:py-3 file:text-sm file:font-medium file:text-fg hover:file:bg-border"
        />
        <span className="text-xs text-muted">PDF only, up to {maxBytes / 1024 / 1024} MB. It replaces the current CV.</span>
      </label>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <Upload aria-hidden className="size-4" />
          )}
          {pending ? "Uploading" : "Upload CV"}
        </Button>
      </div>

      <div aria-live="polite">
        {message.status !== "idle" && message.message && !pending && (
          <p
            className={cn(
              "flex items-start gap-2 rounded-xl border p-3 text-sm text-fg",
              message.status === "success"
                ? "border-accent-ink/40 bg-accent-glow"
                : "border-border-strong bg-surface-2",
            )}
          >
            {message.status === "success" ? (
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
            ) : (
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
            )}
            {message.message}
          </p>
        )}
      </div>
    </form>
  );
}
