import 'server-only';
import { createHmac, randomBytes } from 'crypto';
import { fromThisSite } from '@/services/auth/session';
import { getServices, getSettings } from '@/services/content';
import { notifyNewAudit } from './notify';
import { enquiryStore, pgCode, StoreUnavailableError } from './store';
import type { EnquiryType } from './types';
import { auditSubmission, fieldErrors, newsletterSubmission } from './validation';

/**
 * Handles a public form submission. Order matters:
 * same-site check → size → strict validation → honeypot → timing → rate limit → SAVE → email.
 * The visitor sees success only after the enquiry is saved. Nothing personal is ever logged.
 */

type Result = { status: number; body: { ok?: true; error?: string; fields?: Record<string, string> } };

const LIMITS: Record<EnquiryType, { minMs: number; perHour: number }> = {
  audit: { minMs: 2000, perHour: 5 },
  newsletter: { minMs: 1500, perHour: 5 },
};
const MAX_BODY = 8 * 1024;
const RETRY = 'We could not send your request. Please try again in a moment.';

let fallbackSalt: string | null = null;
/** Salted hash of the client IP: the raw IP is never stored. */
function ipHash(req: Request): string {
  let salt = process.env.ENQUIRY_HASH_SALT;
  if (!salt) {
    // Still private, but rate limits then only hold per server instance. Set ENQUIRY_HASH_SALT in production.
    if (!fallbackSalt) {
      fallbackSalt = randomBytes(32).toString('hex');
      console.warn('[enquiries] ENQUIRY_HASH_SALT is not set; using a temporary random salt.');
    }
    salt = fallbackSalt;
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  return createHmac('sha256', salt).update(ip).digest('hex');
}

function sameSite(req: Request): boolean {
  return fromThisSite(req.headers.get('origin') || req.headers.get('referer'), req.headers);
}

export async function handleSubmission(req: Request, type: EnquiryType): Promise<Result> {
  if (!sameSite(req)) return { status: 403, body: { error: 'Please submit the form from our website.' } };
  if (!(req.headers.get('content-type') || '').includes('application/json')) return { status: 415, body: { error: RETRY } };

  const raw = await req.text().catch(() => '');
  if (raw.length > MAX_BODY) return { status: 413, body: { error: RETRY } };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { status: 400, body: { error: RETRY } };
  }

  const parsed = (type === 'audit' ? auditSubmission : newsletterSubmission).safeParse(json);
  if (!parsed.success) {
    const fields = fieldErrors(parsed.error);
    return { status: 422, body: { error: Object.values(fields)[0] ?? 'Please check the form.', fields } };
  }
  const data = parsed.data as { hp?: string; elapsed?: number; source?: string; email: string } & Record<string, unknown>;

  let store;
  try {
    store = enquiryStore();
  } catch (e) {
    if (e instanceof StoreUnavailableError) console.error('[enquiries] not saved: DATABASE_URL is not set');
    return { status: 503, body: { error: RETRY } };
  }

  try {
    // Every attempt counts (including spam), so bots cannot retry endlessly.
    const tries = await store.hitRateLimit(type, ipHash(req), 60 * 60 * 1000);
    if (tries > LIMITS[type].perHour) return { status: 429, body: { error: 'Too many requests from your connection. Please try again in an hour.' } };

    // Honeypot filled: almost certainly a bot. Pretend success, keep nothing.
    if (data.hp) return { status: 200, body: { ok: true } };
    if (data.elapsed === undefined || data.elapsed < LIMITS[type].minMs) {
      return { status: 422, body: { error: 'That was very quick. Please check your details and send again.' } };
    }

    if (type === 'audit') {
      const a = data as unknown as { name: string; phone: string; email: string; website?: string; service?: string };
      if (a.service) {
        const [services, settings] = await Promise.all([getServices(), getSettings()]);
        const allowed = [...services.map((s) => s.title), settings.audit.otherOption];
        if (!allowed.includes(a.service)) return { status: 422, body: { error: 'Choose an option from the list.', fields: { service: 'Choose an option from the list.' } } };
      }
      const saved = await store.create({
        type: 'audit',
        name: a.name,
        phone: a.phone,
        email: a.email,
        website: a.website || null,
        service: a.service || null,
        sourcePage: data.source || null,
      });
      if (!saved) return { status: 503, body: { error: RETRY } };
      // The lead is safe now. A failed email is recorded, never shown to the visitor as a failure.
      const result = await notifyNewAudit(saved);
      await store.setNotification(saved.id, result.status, result.error).catch(() => console.error('[enquiries] could not record notification status'));
      if (result.status !== 'sent') console.error(`[enquiries] notification ${result.status} for enquiry #${saved.id}: ${result.error}`);
      return { status: 200, body: { ok: true } };
    }

    // Newsletter: an existing active subscription is fine (same answer, no duplicate row, no hint either way).
    await store.create({ type: 'newsletter', name: null, phone: null, email: data.email, website: null, service: null, sourcePage: data.source || null });
    return { status: 200, body: { ok: true } };
  } catch (e) {
    console.error(`[enquiries] ${type} not saved: ${pgCode(e)}`);
    return { status: 503, body: { error: RETRY } };
  }
}
