"use server";

import { eq } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "../auth";
import { CV_KEY, MAX_CV_BYTES } from "../cv";
import { getDb, schema } from "../db";
import { newsletterEmail, sendBatch, sendMail } from "../email";
import { requireEnv } from "../env";
import { oneClickUnsubscribeUrl, unsubscribeUrl } from "../newsletter";
import { SETTINGS_TAG, type SiteSettings } from "../settings";

/** Admin mutations. Each one checks the session first: server actions are public endpoints. */

const uuid = z.uuid();

async function db() {
  await requireAdmin();
  const d = getDb();
  if (!d) throw new Error("Database not configured");
  return d;
}

// --- Enquiries --------------------------------------------------------------

export async function setEnquiryStatus(formData: FormData) {
  const d = await db();
  const id = uuid.parse(formData.get("id"));
  const status = z.enum(["new", "read", "archived"]).parse(formData.get("status"));
  await d.update(schema.enquiries).set({ status }).where(eq(schema.enquiries.id, id));
  refresh();
}

export async function deleteEnquiry(formData: FormData) {
  const d = await db();
  const id = uuid.parse(formData.get("id"));
  await d.delete(schema.enquiries).where(eq(schema.enquiries.id, id));
  redirect("/admin/enquiries");
}

// --- Subscribers ------------------------------------------------------------

export async function deleteSubscriber(formData: FormData) {
  const d = await db();
  const id = uuid.parse(formData.get("id"));
  await d.delete(schema.subscribers).where(eq(schema.subscribers.id, id));
  refresh();
}

// --- Newsletter -------------------------------------------------------------

export type NewsletterState = { status: "idle" | "success" | "error"; message?: string };

const newsletterSchema = z.object({
  subject: z.string().trim().min(3, "Add a subject.").max(150),
  body: z.string().trim().min(20, "Write a little more before sending.").max(20_000),
  mode: z.enum(["test", "send"]),
});

export async function sendNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const d = await db();
  const parsed = newsletterSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
    mode: formData.get("mode"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };
  const { subject, body, mode } = parsed.data;

  try {
    if (mode === "test") {
      const to = requireEnv("CONTACT_TO_EMAIL");
      await sendMail({
        to,
        ...newsletterEmail(`[Test] ${subject}`, body, unsubscribeUrl("test"), oneClickUnsubscribeUrl("test")),
      });
      return { status: "success", message: `Test sent to ${to}.` };
    }

    const recipients = await d
      .select({ email: schema.subscribers.email, token: schema.subscribers.token })
      .from(schema.subscribers)
      .where(eq(schema.subscribers.status, "confirmed"));
    if (recipients.length === 0)
      return { status: "error", message: "There are no confirmed subscribers yet." };

    const failed = await sendBatch(
      recipients.map((r) => ({
        to: r.email,
        ...newsletterEmail(subject, body, unsubscribeUrl(r.token), oneClickUnsubscribeUrl(r.token)),
      })),
    );
    await d.insert(schema.newsletterIssues).values({
      subject,
      body,
      sentAt: new Date(),
      recipientCount: recipients.length - failed,
      failedCount: failed,
    });
    refresh();
    return failed
      ? {
          status: "error",
          message: `Sent to ${recipients.length - failed}, but ${failed} failed. Check Resend.`,
        }
      : {
          status: "success",
          message: `Sent to ${recipients.length} subscriber${recipients.length === 1 ? "" : "s"}.`,
        };
  } catch (err) {
    console.error("[newsletter]", err);
    return { status: "error", message: "Sending failed. Check RESEND_API_KEY and RESEND_FROM_EMAIL." };
  }
}

// --- CV ---------------------------------------------------------------------

export type CvState = { status: "idle" | "success" | "error"; message?: string };

export async function uploadCv(_prev: CvState, formData: FormData): Promise<CvState> {
  const d = await db();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a PDF first." };
  if (file.size > MAX_CV_BYTES) return { status: "error", message: "That file is over 4 MB. Export a smaller PDF." };

  const bytes = Buffer.from(await file.arrayBuffer());
  // Check the content, not just the name: every PDF starts with "%PDF-".
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { status: "error", message: "That isn't a PDF. Upload your CV as a .pdf file." };
  }

  const row = {
    fileName: file.name.replace(/[^\w .()-]/g, "").slice(0, 120) || "CV.pdf",
    contentType: "application/pdf",
    size: bytes.length,
    data: bytes.toString("base64"),
    uploadedAt: new Date(),
  };
  try {
    await d
      .insert(schema.files)
      .values({ key: CV_KEY, ...row })
      .onConflictDoUpdate({ target: schema.files.key, set: row });
  } catch (err) {
    console.error("[cv] upload failed", err);
    return {
      status: "error",
      message: "Couldn't save the file. If this is the first upload, run npm run db:migrate, then try again.",
    };
  }
  refresh();
  return { status: "success", message: "Uploaded. Every Download CV button now gives this file." };
}

export async function deleteCv() {
  const d = await db();
  await d.delete(schema.files).where(eq(schema.files.key, CV_KEY));
  refresh();
}

// --- Settings ---------------------------------------------------------------

export async function saveSettings(formData: FormData) {
  const d = await db();
  const values: SiteSettings = {
    availableForWork: formData.get("availableForWork") === "on",
    availabilityLabel:
      String(formData.get("availabilityLabel") ?? "")
        .trim()
        .slice(0, 60) || "Open to new projects",
  };
  for (const [key, value] of Object.entries(values)) {
    await d
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date() } });
  }
  updateTag(SETTINGS_TAG);
  refresh();
}
