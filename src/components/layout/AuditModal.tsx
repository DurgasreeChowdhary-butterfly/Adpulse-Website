'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SiteSettings } from '@/types/content';
import { Icon } from '@/components/ui/Icon';
import { isEmail, isPhone } from '@/utils/format';

type Fields = { name: string; phone: string; email: string; website: string; service: string };
type Errors = Partial<Record<keyof Fields | 'form', string>>;
const EMPTY: Fields = { name: '', phone: '', email: '', website: '', service: '' };

/**
 * The free growth audit form. Any element with a `data-audit` attribute opens it,
 * so server-rendered buttons need no client code of their own.
 */
export function AuditModal({ copy, serviceOptions, privacy }: { copy: SiteSettings['audit']; serviceOptions: string[]; privacy: SiteSettings['privacy'] }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Fields>({ ...EMPTY, service: serviceOptions[0] ?? '' });
  const [errors, setErrors] = useState<Errors>({});
  const [hp, setHp] = useState('');
  const openedAt = useRef(0);
  const lastFocus = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as Element).closest('[data-audit]');
      if (!trigger) return;
      e.preventDefault();
      lastFocus.current = trigger as HTMLElement;
      setDone(false);
      setErrors({});
      openedAt.current = Date.now();
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => nameRef.current?.focus(), 60);
    else lastFocus.current?.focus();
  }, [open]);

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => setFields((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (fields.name.trim().length < 2) next.name = 'Enter your name.';
    if (!isPhone(fields.phone)) next.phone = 'Enter a valid phone number (10–15 digits).';
    if (!isEmail(fields.email)) next.email = 'Enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, source: window.location.pathname, hp, elapsed: Date.now() - openedAt.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Field problems go next to the field; anything else (saving failed, too many tries...) as a form message.
        const f = (json.fields ?? {}) as Errors;
        const known = (['name', 'phone', 'email', 'website', 'service'] as const).filter((k) => f[k]);
        setErrors(known.length ? Object.fromEntries(known.map((k) => [k, f[k]])) : { form: json.error || 'Something went wrong. Please try again.' });
        return;
      }
      setFields({ ...EMPTY, service: serviceOptions[0] ?? '' });
      setDone(true);
    } catch {
      setErrors({ form: 'No connection. Check your internet and try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal" hidden={!open} role="dialog" aria-modal="true" aria-labelledby="mT" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="dlg">
        <button className="x" aria-label={copy.fields.closeLabel} onClick={() => setOpen(false)}>
          <Icon name="i-x" />
        </button>
        {!done ? (
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h3 id="mT">{copy.title}</h3>
            <p className="lead">{copy.description}</p>
            <form className="audit" onSubmit={submit} noValidate>
              <div className="two">
                <Field id="f-name" label={copy.fields.name} error={errors.name}>
                  <input id="f-name" ref={nameRef} autoComplete="name" value={fields.name} onChange={set('name')} aria-invalid={!!errors.name} />
                </Field>
                <Field id="f-phone" label={copy.fields.phone} error={errors.phone}>
                  <input id="f-phone" type="tel" autoComplete="tel" value={fields.phone} onChange={set('phone')} aria-invalid={!!errors.phone} />
                </Field>
              </div>
              <Field id="f-email" label={copy.fields.email} error={errors.email}>
                <input id="f-email" type="email" autoComplete="email" value={fields.email} onChange={set('email')} aria-invalid={!!errors.email} />
              </Field>
              <Field id="f-site" label={copy.fields.website} error={errors.website}>
                <input id="f-site" placeholder={copy.fields.websitePlaceholder} value={fields.website} onChange={set('website')} />
              </Field>
              <Field id="f-svc" label={copy.fields.service} error={errors.service}>
                <select id="f-svc" value={fields.service} onChange={set('service')}>
                  {serviceOptions.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                  <option>{copy.otherOption}</option>
                </select>
              </Field>
              {/* Honeypot: invisible to people, filled in by bots. */}
              <div className="hp" aria-hidden="true">
                <label htmlFor="f-fax">Fax</label>
                <input id="f-fax" name="fax_number" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
              </div>
              {errors.form && (
                <p className="err" role="alert">
                  {errors.form}
                </p>
              )}
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: 'center', marginTop: 6 }}>
                {copy.submitLabel} <Icon name="i-arrow" />
              </button>
              <Consent privacy={privacy} />
            </form>
          </div>
        ) : (
          <div className="done">
            <div className="tick">
              <Icon name="i-check" />
            </div>
            <h3>{copy.successTitle}</h3>
            <p style={{ color: 'var(--ink-2)' }}>{copy.successText}</p>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              {copy.fields.closeLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="err">{error}</span>}
    </div>
  );
}

/** Optional consent line (Website Settings → Privacy). Hidden while consentText is empty. */
export function Consent({ privacy, className = 'consent' }: { privacy: SiteSettings['privacy']; className?: string }) {
  if (!privacy?.consentText?.trim()) return null;
  return (
    <p className={className}>
      {privacy.consentText}
      {privacy.policyUrl && (
        <>
          {' '}
          <a href={privacy.policyUrl} target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
        </>
      )}
    </p>
  );
}
