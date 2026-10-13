"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { getDb, schema } from "../db";
import { enquiryNotification, sendMail } from "../email";
import { requireEnv } from "../env";
import { ipHash, isBot, visitorHash } from "../privacy";
import { rateLimit } from "../rate-limit";
import type { FormState } from "./forms";

/** FAQ chat: logs every question asked, and turns unanswered ones into enquiries. */

const faqIds = new Set(faq.map((f) => f.id));

/**
 * Records a question for /admin/chats. Returns the log id so an unanswered question can be
 * linked to the email the visitor leaves for it. Never throws: logging must not break the chat.
 */
export async function logChatQuestion(question: string, faqId: string | null): Promise<string | null> {
  const text = String(question ?? "")
    .trim()
    .slice(0, 500);
  const matched = faqId && faqIds.has(faqId) ? faqId : null;
  if (!text) return null;

  try {
    const db = getDb();
    if (!db) return null;
    const h = await headers();
    if (isBot(h.get("user-agent"))) return null;
    const limit = await rateLimit(`chat:${ipHash(h)}`, 60, 60 * 60, db);
    if (!limit.ok) return null;

    const [row] = await db
      .insert(schema.chatLogs)
      .values({
        question: text,
        matchedFaqId: matched,
        answered: matched !== null,
        visitorHash: visitorHash(h),
      })
      .returning({ id: schema.chatLogs.id });
    return row?.id ?? null;
  } catch (err) {
    console.error("[chat] log failed", err);
    return null;
  }
}

const askSchema = z.object({
  email: z.email("Please enter a valid email address.").max(200),
  question: z
    .string()
    .trim()
    .min(3, "Please add your question.")
    .max(1000, "Please keep it under 1,000 characters."),
  logId: z.uuid().nullable(),
});

/** "Leave your email and question": saved as an enquiry, and Jay gets an email about it. */
export async function askJay(_prev: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) return { status: "success", message: "Thanks. Jay will get back to you." };

  const parsed = askSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    question: formData.get("question"),
    logId: formData.get("logId") || null,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const { email, question, logId } = parsed.data;

  try {
    const db = getDb();
    if (!db) throw new Error("DATABASE_URL is not set");
    const h = await headers();
    const hash = ipHash(h);
    const limit = await rateLimit(`chat-ask:${hash}`, 5, 60 * 60, db);
    if (!limit.ok) {
      return { status: "error", message: `You've sent a few questions already. Please email ${site.email}.` };
    }

    const enquiry = {
      type: "Other" as const,
      name: "Chat visitor",
      email,
      message: `Asked in the website chat:\n\n${question}`,
    };
    await db.insert(schema.enquiries).values({ ...enquiry, ipHash: hash });

    // Attach the email to the logged question, or log it now if that didn't happen earlier.
    if (logId) {
      await db
        .update(schema.chatLogs)
        .set({ email })
        .where(and(eq(schema.chatLogs.id, logId), isNull(schema.chatLogs.email)));
    } else {
      await db.insert(schema.chatLogs).values({ question, email, visitorHash: visitorHash(h) });
    }

    after(async () => {
      try {
        await sendMail({
          to: requireEnv("CONTACT_TO_EMAIL"),
          ...enquiryNotification({ ...enquiry, type: "Chat question" }),
        });
      } catch (err) {
        console.error("[chat] email failed", err);
      }
    });

    return { status: "success", message: `Thanks. Jay will reply to ${email}.` };
  } catch (err) {
    console.error("[chat] ask failed", err);
    return {
      status: "error",
      message: `That didn't send. Please email ${site.email} or use WhatsApp instead.`,
    };
  }
}
