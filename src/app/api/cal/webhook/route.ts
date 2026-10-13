import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/server/db";
import { optionalEnv } from "@/server/env";

/**
 * Cal.com webhook: keeps /admin/bookings in sync with booked, rescheduled and cancelled calls.
 * Set it up in Cal.com > Settings > Developer > Webhooks with this URL and a secret, and put the
 * same secret in CAL_WEBHOOK_SECRET. Requests without a valid signature are rejected.
 */

const attendee = z.object({ name: z.string().optional(), email: z.string().optional() });

const body = z.object({
  triggerEvent: z.string(),
  payload: z
    .object({
      uid: z.string().optional(),
      title: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      attendees: z.array(attendee).optional(),
      // Set on a rescheduled booking: the uid of the booking it replaces.
      rescheduleUid: z.string().optional(),
      fromReschedule: z.string().optional(),
    })
    .loose()
    .optional(),
});

function validSignature(raw: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

const date = (v?: string) => (v && !Number.isNaN(Date.parse(v)) ? new Date(v) : null);

export async function POST(request: Request) {
  const secret = optionalEnv("CAL_WEBHOOK_SECRET");
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-cal-signature-256"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let parsed: z.infer<typeof body>;
  try {
    parsed = body.parse(JSON.parse(raw));
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const { triggerEvent, payload } = parsed;
  if (triggerEvent === "PING" || !payload?.uid) return Response.json({ ok: true });

  const db = getDb();
  if (!db) return new Response("Database not configured", { status: 503 });

  const status =
    triggerEvent === "BOOKING_CANCELLED" || triggerEvent === "BOOKING_REJECTED"
      ? "cancelled"
      : triggerEvent === "BOOKING_CREATED" || triggerEvent === "BOOKING_RESCHEDULED"
        ? "booked"
        : null;
  if (!status) return Response.json({ ok: true, ignored: triggerEvent });

  const person = payload.attendees?.[0];
  const row = {
    calUid: payload.uid,
    title: payload.title ?? null,
    name: person?.name ?? null,
    email: person?.email ?? null,
    startTime: date(payload.startTime),
    endTime: date(payload.endTime),
    status,
  };

  await db
    .insert(schema.bookings)
    .values(row)
    .onConflictDoUpdate({
      target: schema.bookings.calUid,
      // A cancellation can arrive with less detail, so only the status is overwritten then.
      set: status === "cancelled" ? { status } : row,
    });

  const replaced = payload.rescheduleUid ?? payload.fromReschedule;
  if (triggerEvent === "BOOKING_RESCHEDULED" && replaced && replaced !== payload.uid) {
    await db
      .update(schema.bookings)
      .set({ status: "rescheduled" })
      .where(eq(schema.bookings.calUid, replaced));
  }

  return Response.json({ ok: true });
}
