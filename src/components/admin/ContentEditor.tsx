'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CollectionKey } from '@/types/content';
import { FieldEditor, RefsContext, collectShapes, type EditorRefs } from './FieldEditor';

interface Props {
  collection: CollectionKey;
  initial: any;
  title: string;
  description: string;
  preview?: string;
  writable: boolean;
  /** Lists offered as dropdowns in the form */
  refs: { services: { value: string; label: string }[]; icons: string[] };
}

/** Edits one content collection and saves it through the admin API. */
export function ContentEditor({ collection, initial, title, description, preview, writable, refs }: Props) {
  const [saved, setSaved] = useState<any>(initial);
  const [data, setData] = useState<any>(initial);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ text: string; kind?: 'ok' | 'err' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  const shapes = useMemo(() => collectShapes(initial), [initial]);
  const ctx: EditorRefs = useMemo(
    () => ({
      collection,
      services: refs.services,
      icons: refs.icons,
      categories: Array.isArray(data?.categories) ? data.categories.filter((c: any) => c.key !== 'all').map((c: any) => ({ value: c.key, label: c.label })) : [],
      shapes,
    }),
    [collection, refs, data?.categories, shapes],
  );

  function change(next: any) {
    setData(next);
    setDirty(true);
    setStatus(null);
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/content/${collection}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      const json = await res.json();
      setData(json.data);
      setSaved(json.data);
      setDirty(false);
      setStatus({ text: `Saved at ${new Date().toLocaleTimeString()} · may take up to a minute to appear on the website`, kind: 'ok' });
    } else {
      const err = await res.json().catch(() => ({}));
      setStatus({ text: err.error || 'Save failed', kind: 'err' });
    }
  }

  return (
    <>
      <div className="adm-top">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="adm-actions">
          {status && <span className={`adm-status ${status.kind ?? ''}`}>{status.text}</span>}
          {dirty && !status && <span className="adm-status">Unsaved changes</span>}
          <button
            className="adm-btn"
            onClick={() => {
              setData(saved);
              setDirty(false);
            }}
            disabled={!dirty}
          >
            Reset
          </button>
          {preview && (
            <a className="adm-btn" href={preview} target="_blank" rel="noreferrer">
              Preview ↗
            </a>
          )}
          <button className="adm-btn primary" onClick={save} disabled={!dirty || saving || !writable}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
      {!writable && (
        <div className="adm-note">
          Saving is disabled in this environment. Run locally with <code>npm run dev</code>, connect a backend (<code>CONTENT_SOURCE=api</code>), or set{' '}
          <code>ALLOW_CONTENT_WRITES=true</code> on a server with a writable disk.
        </div>
      )}
      <RefsContext.Provider value={ctx}>
        <div className="fe-group">
          <FieldEditor name={collection} value={data} onChange={change} />
        </div>
      </RefsContext.Provider>
    </>
  );
}
