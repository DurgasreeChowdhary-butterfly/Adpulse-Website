import 'server-only';
import type { Enquiry, NotificationStatus } from './types';

/**
 * Emails AdPulse about a new audit request through Resend (https://resend.com).
 * Needs RESEND_API_KEY, ENQUIRY_NOTIFICATION_EMAIL (comma-separated for several) and ENQUIRY_FROM_EMAIL.
 * Never throws: returns the outcome so the caller can record it. Errors contain no personal data.
 */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export async function notifyNewAudit(e: Enquiry): Promise<{ status: NotificationStatus; error: string | null }> {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.ENQUIRY_NOTIFICATION_EMAIL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (!key || !to.length || !from) return { status: 'not_configured', error: 'Missing RESEND_API_KEY, ENQUIRY_NOTIFICATION_EMAIL or ENQUIRY_FROM_EMAIL' };

  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const when = new Date(e.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const rows: [string, string | null][] = [
    ['Name', e.name],
    ['Phone', e.phone],
    ['Email', e.email],
    ['Website', e.website],
    ['Needs help with', e.service],
    ['Sent from page', e.sourcePage],
    ['Received', `${when} IST`],
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0C1530">
<h2 style="margin:0 0 12px">New free growth audit request</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="color:#4E586F;padding-right:16px">${k}</td><td><b>${esc(v!)}</b></td></tr>`)
    .join('')}</table>
<p style="margin-top:16px">Reply to this email to answer the lead directly.${site ? ` Manage enquiries: <a href="${esc(site)}/admin/enquiries">${esc(site)}/admin/enquiries</a>` : ''}</p></div>`;
  const text = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    // RESEND_API_BASE is only for automated tests (points at a local mock).
    const res = await fetch(`${process.env.RESEND_API_BASE || 'https://api.resend.com'}/emails`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        reply_to: e.email,
        subject: oneLine(`New audit request: ${e.name ?? e.email}`).slice(0, 150),
        html,
        text,
      }),
      signal: controller.signal,
    });
    return res.ok ? { status: 'sent', error: null } : { status: 'failed', error: `Resend HTTP ${res.status}` };
  } catch (err) {
    return { status: 'failed', error: (err as Error).name === 'AbortError' ? 'Resend timeout' : 'Resend unreachable' };
  } finally {
    clearTimeout(timer);
  }
}
