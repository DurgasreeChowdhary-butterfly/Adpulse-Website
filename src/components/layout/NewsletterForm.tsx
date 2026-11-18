'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { SiteSettings } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { isEmail } from '@/utils/format';
import { Consent } from './AuditModal';

export function NewsletterForm({ label, placeholder, successText, privacy }: { label: string; placeholder: string; successText: string; privacy: SiteSettings['privacy'] }) {
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const shownAt = useRef(Date.now());

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!isEmail(email)) return setMsg({ text: 'Enter a valid email address.', error: true });
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: window.location.pathname, hp, elapsed: Date.now() - shownAt.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return setMsg({ text: json.error || 'Something went wrong. Please try again.', error: true });
      setEmail('');
      setMsg({ text: successText });
    } catch {
      setMsg({ text: 'No connection. Check your internet and try again.', error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="news" onSubmit={submit} noValidate>
      <label htmlFor="nl-email">{label}</label>
      <div className="f">
        <input id="nl-email" type="email" placeholder={placeholder} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button aria-label="Subscribe" disabled={busy} aria-busy={busy}>
          <Icon name="i-arrow" />
        </button>
      </div>
      {/* Honeypot: invisible to people, filled in by bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="nl-fax">Fax</label>
        <input id="nl-fax" name="fax_number" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </div>
      {msg && (
        <p className="msg" role={msg.error ? 'alert' : 'status'} style={msg.error ? { color: '#FF9B7A' } : undefined}>
          {msg.text}
        </p>
      )}
      <Consent privacy={privacy} className="consent dark" />
    </form>
  );
}
