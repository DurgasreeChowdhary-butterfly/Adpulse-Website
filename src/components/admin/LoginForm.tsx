'use client';

import { useState } from 'react';

/** Password form. Sends the password to /api/admin/login over the same origin; the session is an HTTP-only cookie. */
export function LoginForm({ configured, next, signedOut }: { configured: boolean; next: string; signedOut: boolean }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="adm-login-msg err" role="alert">
        Admin access is disabled because <code>ADMIN_PASSWORD</code> is not set on the server. Add it to <code>.env.local</code> (development) or the
        hosting environment variables (production), then restart.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return setError('Enter the password.');
    setBusy(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, next }),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      // Full navigation so the server renders the panel with the new cookie.
      window.location.assign(json.redirect || '/admin');
      return;
    }
    setBusy(false);
    setPassword('');
    setError(json.error || 'Could not sign in. Try again.');
  }

  return (
    <form className="adm-login-form" onSubmit={submit} noValidate>
      {signedOut && !error && (
        <div className="adm-login-msg ok" role="status">
          You have been signed out.
        </div>
      )}
      {error && (
        <div className="adm-login-msg err" role="alert">
          {error}
        </div>
      )}
      <label htmlFor="adm-pw">Password</label>
      <div className="adm-login-pw">
        <input
          id="adm-pw"
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          disabled={busy}
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      <button className="adm-btn primary adm-login-submit" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
