'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'new' | 'contacted' | 'closed';
type Enquiry = {
  id: number;
  type: 'audit' | 'newsletter';
  name: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  service: string | null;
  sourcePage: string | null;
  status: Status;
  notificationStatus: string;
  notificationError: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<Status, string> = { new: 'New', contacted: 'Contacted', closed: 'Closed' };
const NOTIFY_LABEL: Record<string, string> = { sent: 'Emailed', failed: 'Email failed', not_configured: 'Email not set up', pending: 'Sending…', not_required: '—' };
const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

/** Admin list of form submissions: audit requests and newsletter sign-ups. */
export function EnquiriesManager() {
  const [type, setType] = useState<'audit' | 'newsletter'>('audit');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [items, setItems] = useState<Enquiry[]>([]);
  const [storage, setStorage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null);
  const reqId = useRef(0);

  const query = new URLSearchParams(Object.entries({ type, status, q: q.trim(), from, to }).filter(([, v]) => v)).toString();

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/enquiries?${query}`);
      const json = await res.json();
      if (id !== reqId.current) return; // a newer search is on its way
      if (!res.ok) throw new Error(json.error);
      setItems(json.items);
      setStorage(json.storage);
    } catch (e) {
      if (id === reqId.current) setMsg({ text: (e as Error).message || 'Could not load enquiries.', kind: 'err' });
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce typing in the search box
    return () => clearTimeout(t);
  }, [load]);

  async function changeStatus(e: Enquiry, next: Status) {
    const prev = e.status;
    setItems((list) => list.map((x) => (x.id === e.id ? { ...x, status: next } : x)));
    try {
      const res = await fetch(`/api/admin/enquiries/${e.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not update.');
      setMsg({ text: `#${e.id} marked ${STATUS_LABEL[next]}`, kind: 'ok' });
      if (status && status !== next) load();
    } catch (err) {
      setItems((list) => list.map((x) => (x.id === e.id ? { ...x, status: prev } : x)));
      setMsg({ text: (err as Error).message, kind: 'err' });
    }
  }

  const audit = type === 'audit';
  return (
    <>
      <div className="adm-top">
        <div>
          <h1>Enquiries</h1>
          <p>Every form submission from the website, newest first. Update the status as you follow up.</p>
        </div>
        <div className="adm-actions">
          {msg && <span className={`adm-status ${msg.kind}`}>{msg.text}</span>}
          <a className="adm-btn" href={`/api/admin/enquiries/export?${query}`}>
            Export CSV
          </a>
        </div>
      </div>

      {storage === 'dev-file' && (
        <div className="adm-note">
          <b>Development only.</b> No database is connected, so submissions are kept in <code>.data/enquiries.dev.json</code> on this computer (git-ignored). In
          production they are stored in PostgreSQL.
        </div>
      )}

      <div className="enq-tabs" role="tablist">
        {(['audit', 'newsletter'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={type === t} className={`adm-btn sm${type === t ? ' primary' : ''}`} onClick={() => setType(t)}>
            {t === 'audit' ? 'Audit requests' : 'Newsletter sign-ups'}
          </button>
        ))}
      </div>

      <div className="enq-filters">
        <input type="search" placeholder={audit ? 'Search name, email, phone, website, service…' : 'Search email or page…'} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>
              {audit ? STATUS_LABEL[s] : s === 'closed' ? 'Unsubscribed' : STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <label>
          From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      <div className="adm-card enq-card">
        <div className="enq-count">{loading ? 'Loading…' : `${items.length} ${audit ? 'request' : 'sign-up'}${items.length === 1 ? '' : 's'}`}</div>
        {!loading && !items.length ? (
          <p className="enq-empty">Nothing here yet.</p>
        ) : (
          <div className="enq-scroll">
            <table className="enq-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Status</th>
                  {audit && <th>Name</th>}
                  <th>Email</th>
                  {audit && <th>Phone</th>}
                  {audit && <th>Website</th>}
                  {audit && <th>Needs help with</th>}
                  <th>Source page</th>
                  {audit && <th>Notification</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className={`st-${e.status}`}>
                    <td className="nowrap">{when(e.createdAt)}</td>
                    <td>
                      <select value={e.status} onChange={(ev) => changeStatus(e, ev.target.value as Status)} aria-label={`Status of enquiry ${e.id}`}>
                        {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                          <option key={s} value={s}>
                            {audit ? STATUS_LABEL[s] : s === 'closed' ? 'Unsubscribed' : STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    {audit && <td>{e.name}</td>}
                    <td>
                      <a href={`mailto:${e.email}`}>{e.email}</a>
                    </td>
                    {audit && <td className="nowrap">{e.phone && <a href={`tel:${e.phone.replace(/[^\d+]/g, '')}`}>{e.phone}</a>}</td>}
                    {audit && <td>{e.website}</td>}
                    {audit && <td>{e.service}</td>}
                    <td>{e.sourcePage}</td>
                    {audit && (
                      <td className={`nowrap ntf-${e.notificationStatus}`} title={e.notificationError ?? ''}>
                        {NOTIFY_LABEL[e.notificationStatus] ?? e.notificationStatus}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
