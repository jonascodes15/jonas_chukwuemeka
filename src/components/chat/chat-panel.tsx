"use client";

import { ArrowUp, ArrowUpRight, Check, Loader2, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { chatFallback, chatGreeting, faq } from "@/content/faq";
import { site, whatsappHref } from "@/content/site";
import type { FaqItem } from "@/content/types";
import { isSmallTalk, matchFaq } from "@/lib/faq-match";
import { cn } from "@/lib/utils";
import { askJay, logChatQuestion } from "@/server/actions/chat";
import type { FormState } from "@/server/actions/forms";

const EASE = [0.16, 1, 0.3, 1] as const;
const CHIPS_SHOWN = 4;

type Message =
  | { id: number; from: "user"; text: string }
  | { id: number; from: "bot"; text: string; action?: FaqItem["action"] }
  | { id: number; from: "bot"; text: string; fallback: { question: string } };
type NewMessage = Message extends infer M ? (M extends Message ? Omit<M, "id"> : never) : never;

/**
 * The FAQ chat. Answers come from src/content/faq.ts, never from an AI model. Every question is
 * logged for /admin/chats; one without an answer offers a short form that reaches Jay as an enquiry.
 * Stays mounted once opened, so the conversation survives closing and reopening.
 */
export default function ChatPanel({
  open,
  onClose,
  available,
  availabilityLabel,
}: {
  open: boolean;
  /** Also returns focus to the chat button. */
  onClose: () => void;
  available: boolean;
  availabilityLabel: string;
}) {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: chatGreeting }]);
  const [asked, setAsked] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [showAllChips, setShowAllChips] = useState(false);
  const nextId = useRef(1);
  // Log ids for unanswered questions, keyed by the fallback message they belong to.
  const [logIds, setLogIds] = useState<Record<number, string>>({});

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus on open (the text box only with a mouse, so phones don't pop the keyboard up).
  useEffect(() => {
    if (!open) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    (fine ? inputRef.current : panelRef.current)?.focus({ preventScroll: true });
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, typing, reduce]);

  const close = onClose;

  const add = (m: NewMessage) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id }]);
    return id;
  };

  const ask = (text: string, chosen?: FaqItem) => {
    const question = text.trim().slice(0, 300);
    if (!question || typing) return;
    add({ from: "user", text: question });
    setInput("");
    setShowAllChips(false);

    const match = chosen ?? matchFaq(question, faq);
    const smallTalk = !match && isSmallTalk(question);
    if (match) setAsked((a) => (a.includes(match.id) ? a : [...a, match.id]));

    // Greetings and thanks aren't questions, so they aren't logged.
    const log = smallTalk ? Promise.resolve(null) : logChatQuestion(question, match?.id ?? null);

    setTyping(true);
    window.setTimeout(
      () => {
        setTyping(false);
        if (match) {
          add({ from: "bot", text: match.answer, action: match.action });
        } else if (smallTalk) {
          const thanks = /thank/i.test(question);
          add({
            from: "bot",
            text: thanks
              ? "You're welcome. Ask anything else, or pick a question below."
              : "Hi there. Ask me anything about Jay's work, or pick a question below.",
          });
        } else {
          const id = add({ from: "bot", text: chatFallback, fallback: { question } });
          void log.then((logId) => {
            if (logId) setLogIds((ids) => ({ ...ids, [id]: logId }));
          });
        }
      },
      reduce ? 0 : 550,
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const remaining = faq.filter((f) => !asked.includes(f.id));
  const chips = showAllChips ? remaining : remaining.slice(0, CHIPS_SHOWN);
  const last = messages[messages.length - 1];
  const showChips = !typing && last?.from === "bot" && !("fallback" in last) && remaining.length > 0;

  return (
    <motion.div
      ref={panelRef}
      id="chat-panel"
      role="dialog"
      aria-modal="false"
      aria-label="Chat with Jay"
      tabIndex={-1}
      inert={!open}
      onKeyDown={(e) => e.key === "Escape" && close()}
      initial={false}
      // Closed, it's transparent, inert (skipped by keyboard and screen readers) and click-through.
      animate={open ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
      style={{ transformOrigin: "bottom right" }}
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 flex h-[min(38rem,calc(100dvh-5.5rem))] flex-col overflow-hidden rounded-3xl border border-border-strong bg-surface shadow-[0_30px_80px_-20px_rgb(var(--shadow-color)/0.6)] outline-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-92",
        !open && "pointer-events-none",
      )}
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="relative shrink-0">
          <Image
            src="/images/me.jpg"
            alt=""
            width={40}
            height={40}
            sizes="40px"
            className="size-10 rounded-full object-cover object-top"
          />
          {available && (
            <span
              aria-hidden
              className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-surface bg-accent"
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold tracking-tight text-fg">Ask Jay</p>
          <p className="truncate text-xs text-muted">
            {available ? availabilityLabel : "Answers from Jay's FAQ"}
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close chat"
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <X aria-hidden className="size-5" />
        </button>
      </header>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={reduce || m.id === 0 ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
          >
            {m.from === "user" ? (
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-accent-contrast">
                {m.text}
              </p>
            ) : (
              <div className="max-w-[90%] space-y-2.5">
                <p className="rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2.5 text-sm leading-relaxed text-fg">
                  {m.text}
                </p>
                {"action" in m && m.action && <ActionLink action={m.action} onNavigate={close} />}
                {"fallback" in m && <AskForm question={m.fallback.question} logId={logIds[m.id] ?? null} />}
              </div>
            )}
          </motion.div>
        ))}

        {typing && (
          <div className="flex" aria-label="Typing">
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-3.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="size-1.5 rounded-full bg-muted"
                  animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </span>
          </div>
        )}

        {showChips && (
          <div className="flex flex-col items-start gap-2 pt-1">
            {chips.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => ask(f.question, f)}
                className="rounded-pill border border-border-strong px-3.5 py-2 text-left text-sm text-fg transition-colors hover:border-accent-ink hover:bg-surface-2"
              >
                {f.question}
              </button>
            ))}
            {!showAllChips && remaining.length > CHIPS_SHOWN && (
              <button
                type="button"
                onClick={() => setShowAllChips(true)}
                className="px-1 text-sm font-medium text-accent-ink hover:underline"
              >
                More questions ({remaining.length - CHIPS_SHOWN})
              </button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
          placeholder="Type your question"
          aria-label="Type your question"
          className="h-11 min-w-0 flex-1 rounded-pill border border-border bg-bg px-4 text-sm text-fg placeholder:text-muted focus:border-accent-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-contrast transition-opacity disabled:opacity-40"
        >
          <ArrowUp aria-hidden className="size-5" />
        </button>
      </form>
    </motion.div>
  );
}

/** The button under an answer: contact form, booking, WhatsApp, work, a case study or the CV. */
function ActionLink({
  action,
  onNavigate,
}: {
  action: NonNullable<FaqItem["action"]>;
  onNavigate: () => void;
}) {
  const className =
    "inline-flex items-center gap-1.5 rounded-pill bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast transition-[filter] hover:brightness-105";
  const icon = <ArrowUpRight aria-hidden className="size-4" />;
  const track = `chat:${action.target === "book" ? "book-call" : action.target}`;

  const internal =
    action.target === "case-study" && action.slug
      ? `/work/${action.slug}`
      : action.target === "work"
        ? "/#work"
        : action.target === "contact" || (action.target === "book" && !site.calLink)
          ? "/#contact"
          : null;

  if (internal) {
    return (
      <Link href={internal} onClick={onNavigate} data-track={track} className={className}>
        {action.label}
        {icon}
      </Link>
    );
  }
  if (action.target === "cv") {
    return (
      <a href={site.cv.href} download={site.cv.fileName} data-track={track} className={className}>
        {action.label}
        {icon}
      </a>
    );
  }
  // Booking links open the Cal.com pop-up (see BookingLinks); WhatsApp opens the app.
  const href = action.target === "book" ? site.calLink! : whatsappHref();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" data-track={track} className={className}>
      {action.label}
      {icon}
    </a>
  );
}

const idle: FormState = { status: "idle" };

/** "Leave your email": sends the unanswered question to Jay as an enquiry. */
function AskForm({ question, logId }: { question: string; logId: string | null }) {
  const [state, action, pending] = useActionState(askJay, idle);

  if (state.status === "success") {
    return (
      <p className="flex items-start gap-2 rounded-2xl border border-border px-3.5 py-2.5 text-sm text-fg">
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
        {state.message}
      </p>
    );
  }

  // Submitting through onSubmit (not the action prop) keeps the email in the box if sending fails.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-2xl border border-border p-3">
      <input type="hidden" name="question" value={question} />
      <input type="hidden" name="logId" value={logId ?? ""} />
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="block text-xs text-muted" htmlFor="chat-email">
        Your email
      </label>
      <div className="flex gap-2">
        <input
          id="chat-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-10 min-w-0 flex-1 rounded-pill border border-border bg-bg px-3.5 text-sm text-fg placeholder:text-muted focus:border-accent-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-pill bg-accent px-4 text-sm font-medium text-accent-contrast disabled:opacity-60"
        >
          {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
          Send
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="rounded-xl border border-border-strong bg-surface-2 p-2.5 text-xs text-fg">
          {state.message}
        </p>
      )}
    </form>
  );
}
