import type { CSSProperties } from "react";

const WORD_STEP = 0.06;
const FIRST_DELAY = 0.1;

/**
 * Headline that rises in word by word from behind a mask, then sweeps a lime highlight
 * behind the `highlight` phrase (a run of words inside `text`). All of it is CSS animation
 * (`rise`, `highlight-sweep` and `ink` in globals.css), so the headline paints with the HTML
 * and costs no JavaScript.
 */
export function HeroHeadline({ text, highlight }: { text: string; highlight: string }) {
  const start = text.indexOf(highlight);
  if (start < 0) return <Words list={split(text)} offset={0} />;

  const before = split(text.slice(0, start));
  const marked = split(highlight);
  const rest = text.slice(start + highlight.length);
  const after = split(rest);
  // Punctuation right after the highlight ("products.") stays on its line instead of wrapping alone.
  const tail = /^\S/.test(rest) ? after.shift() : undefined;
  const sweepAt = FIRST_DELAY + (before.length + marked.length) * WORD_STEP + 0.3;

  return (
    <>
      <Words list={before} offset={0} />{" "}
      <span className="whitespace-nowrap">
        <span
          className="relative isolate inline-block"
          style={{ animation: `ink 0.4s ease-out ${sweepAt + 0.25}s both` }}
        >
          <span
            aria-hidden
            className="absolute -inset-x-[0.1em] top-[0.06em] bottom-[0.1em] -z-10 origin-left rounded-[0.1em] bg-accent"
            style={{ animation: `highlight-sweep 0.9s var(--ease-out-expo) ${sweepAt}s both` }}
          />
          <Words list={marked} offset={before.length} />
        </span>
        {/* Clears the highlight box, which reaches 0.1em past the last word. */}
        {tail && (
          <span className="ml-[0.1em]">
            <Words list={[tail]} offset={before.length + marked.length} />
          </span>
        )}
      </span>
      {after.length > 0 && " "}
      <Words list={after} offset={before.length + marked.length + (tail ? 1 : 0)} />
    </>
  );
}

function split(s: string) {
  return s.split(/\s+/).filter(Boolean);
}

function Words({ list, offset }: { list: string[]; offset: number }) {
  return list.map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className="inline-block overflow-hidden pb-[0.08em] align-top">
        <span
          className="animate-rise inline-block"
          style={{ "--enter-delay": `${FIRST_DELAY + (offset + i) * WORD_STEP}s` } as CSSProperties}
        >
          {word}
        </span>
      </span>
    </span>
  ));
}
