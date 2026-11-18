import { z } from 'zod';
import { isPhone } from '@/utils/format';
import { ENQUIRY_STATUSES, ENQUIRY_TYPES } from './types';

/**
 * Exactly what each form may send. `strictObject` rejects any other field,
 * so nothing unexpected is ever stored or emailed.
 */

const clean = (max: number) =>
  z
    .string()
    .max(max * 2)
    .transform((s) => s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim())
    .pipe(z.string().max(max, `Keep this under ${max} characters.`));

const email = z
  .string()
  .max(254)
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a valid email address.').max(254));

/** Path of the page the form was on, e.g. /services/seo-geo */
const sourcePage = z
  .string()
  .max(200)
  .regex(/^\/[\w\-/.]*$/, 'Invalid page')
  .optional();

/** Spam checks (not stored): honeypot must stay empty; elapsed = ms since the form appeared. */
const antiSpam = { hp: z.string().max(200).optional(), elapsed: z.number().int().min(0).max(86_400_000).optional() };

export const auditSubmission = z.strictObject({
  name: clean(100).pipe(z.string().min(2, 'Enter your name.')),
  phone: z.string().max(30).transform((s) => s.trim()).refine(isPhone, 'Enter a valid phone number (10–15 digits).'),
  email,
  website: clean(200)
    .refine((s) => s === '' || /^(https?:\/\/)?[^\s/]+\.[^\s]{2,}$/i.test(s), 'Enter a website like yourbrand.com, or leave it empty.')
    .optional(),
  service: clean(120).optional(),
  source: sourcePage,
  ...antiSpam,
});

export const newsletterSubmission = z.strictObject({ email, source: sourcePage, ...antiSpam });

export const statusUpdate = z.strictObject({ status: z.enum(ENQUIRY_STATUSES) });

export const listQuery = z.object({
  type: z.enum(ENQUIRY_TYPES).optional(),
  status: z.enum(ENQUIRY_STATUSES).optional(),
  q: z.string().max(100).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/** First message per field, for showing next to the inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.code === 'unrecognized_keys' ? 'Unexpected field.' : issue.message;
  }
  return out;
}
