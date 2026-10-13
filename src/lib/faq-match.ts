import type { FaqItem } from "@/content/types";

/** Lower case, letters and digits only, single spaces, padded so " word" finds a word start. */
const normalize = (s: string) =>
  ` ${s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

const SMALL_TALK =
  /^ (hi|hello|hey|hiya|good (morning|afternoon|evening)|thanks|thank you|ok|okay|cool)( [a-z]+)? $/;

/** True for a greeting or a thank-you, which gets a friendly reply instead of the fallback. */
export function isSmallTalk(input: string) {
  return SMALL_TALK.test(normalize(input));
}

/**
 * Best FAQ answer for a typed question, or null. Each keyword that starts a word in the
 * question scores a point (two for phrases, which are more specific); an exact question
 * scores highest. Ties go to the FAQ listed first.
 */
export function matchFaq(input: string, items: FaqItem[]): FaqItem | null {
  const text = normalize(input);
  if (text.trim().length < 2) return null;

  let best: FaqItem | null = null;
  let bestScore = 0;
  for (const item of items) {
    let score = normalize(item.question) === text ? 100 : 0;
    for (const keyword of item.keywords) {
      const k = normalize(keyword).trimEnd();
      if (text.includes(k)) score += k.trim().includes(" ") ? 2 : 1;
    }
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best;
}
