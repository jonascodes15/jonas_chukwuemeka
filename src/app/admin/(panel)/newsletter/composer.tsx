"use client";

import { CheckCircle2, CircleAlert, FlaskConical, Loader2, Send } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { sendNewsletter, type NewsletterState } from "@/server/actions/admin";
import { cn } from "@/lib/utils";

/**
 * Submits manually (not through the form's action prop) so the draft survives a test send.
 * The form is only cleared after a real send succeeds.
 */
export function Composer({
  recipients,
  defaultSubject,
  defaultBody,
}: {
  recipients: number;
  /** Prefilled when arriving from a blog post's "Email subscribers" link. */
  defaultSubject?: string;
  defaultBody?: string;
}) {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(sendNewsletter, {
    status: "idle",
  });
  const [mode, setMode] = useState<"test" | "send">("test");
  const formRef = useRef<HTMLFormElement>(null);
  // The mode of the request that produced the current `state`.
  const sentMode = useRef<"test" | "send">("test");
  const plural = recipients === 1 ? "" : "s";

  // Runs only when a new result arrives, so switching mode never clears the draft early.
  useEffect(() => {
    if (state.status === "success" && sentMode.current === "send") formRef.current?.reset();
  }, [state]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const next = submitter?.value === "send" ? "send" : "test";
    if (
      next === "send" &&
      !window.confirm(`Send this newsletter to ${recipients} subscriber${plural}? This can't be undone.`)
    ) {
      return;
    }
    const data = new FormData(e.currentTarget);
    data.set("mode", next);
    setMode(next);
    sentMode.current = next;
    startTransition(() => action(data));
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field id="nl-subject" label="Subject">
        <input
          id="nl-subject"
          name="subject"
          required
          maxLength={150}
          defaultValue={defaultSubject}
          className={inputClasses}
        />
      </Field>
      <Field
        id="nl-body"
        label="Message"
        hint="Plain text. Leave a blank line between paragraphs. Links become clickable. An unsubscribe link is added automatically."
      >
        <textarea
          id="nl-body"
          name="body"
          rows={14}
          required
          defaultValue={defaultBody}
          className={cn(inputClasses, "resize-y")}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" value="test" variant="secondary" disabled={pending}>
          {pending && mode === "test" ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <FlaskConical aria-hidden className="size-4" />
          )}
          Send me a test
        </Button>
        <Button type="submit" value="send" disabled={pending || recipients === 0}>
          {pending && mode === "send" ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <Send aria-hidden className="size-4" />
          )}
          Send to {recipients} subscriber{plural}
        </Button>
      </div>

      <div aria-live="polite">
        {state.status !== "idle" && state.message && !pending && (
          <p
            className={cn(
              "flex items-start gap-2 rounded-xl border p-3 text-sm",
              state.status === "success"
                ? "border-accent-ink/40 bg-accent-glow text-fg"
                : "border-border-strong bg-surface-2 text-fg",
            )}
          >
            {state.status === "success" ? (
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
            ) : (
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
            )}
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
