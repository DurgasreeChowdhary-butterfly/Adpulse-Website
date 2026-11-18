'use client';

import { useCallback, useEffect, useState } from 'react';

type Usage = { collection: string; field: string };
type MediaFile = { url: string; name: string; folder: string; size: number; alt: string; usedIn: Usage[] };

/**
 * Media library: upload, view, replace, delete (when unused) and set alt text.
 * Files go to the active media storage (local disk today, cloud later); alt text is saved as content.
 */
export function MediaManager({ writable }: { writable: boolean }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [storage, setStorage] = useState<{ mode: string; text: string } | null>(null);
  const [msg, setMsg] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null);
  const [over, setOver] = useState(false);
  const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/media');
    const json = await res.json();
    setFiles(json.files);
    setStorage({ mode: json.mode, text: json.storage });
    if (json.error) setMsg({ text: json.error, kind: 'err' });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function send(file: File, replace?: string) {
    const body = new FormData();
    body.append('file', file);
    if (replace) body.append('replace', replace);
    const res = await fetch('/api/admin/media', { method: 'POST', body });
    const json = await res.json();
    if (!res.ok) return setMsg({ text: json.error || 'Upload failed', kind: 'err' });
    setMsg({ text: replace ? `Replaced. ${json.updatedCollections} content section(s) now use the new image.` : `Uploaded ${json.url}`, kind: 'ok' });
  }

  async function upload(list: FileList | null) {
    if (!list?.length) return;
    for (const file of Array.from(list)) await send(file);
    load();
  }

  async function replace(f: MediaFile, list: FileList | null) {
    if (!list?.[0]) return;
    await send(list[0], f.url);
    load();
  }

  async function saveAlt(f: MediaFile, alt: string) {
    if (alt === f.alt) return;
    const res = await fetch('/api/admin/media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: f.url, alt }) });
    setMsg(res.ok ? { text: `Alt text saved for ${f.name}`, kind: 'ok' } : { text: 'Could not save alt text', kind: 'err' });
    load();
  }

  async function remove(f: MediaFile) {
    if (!window.confirm(`Delete ${f.name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/media?url=${encodeURIComponent(f.url)}`, { method: 'DELETE' });
    const json = await res.json();
    setMsg(res.ok ? { text: `Deleted ${f.name}`, kind: 'ok' } : { text: json.error || 'Delete failed', kind: 'err' });
    load();
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMsg({ text: `Copied ${url}`, kind: 'ok' });
    } catch {
      setMsg({ text: url, kind: 'ok' });
    }
  }

  const shown = files.filter((f) => filter === 'all' || (filter === 'used' ? f.usedIn.length > 0 : f.usedIn.length === 0));

  return (
    <>
      <div className="adm-top">
        <div>
          <h1>Media Library</h1>
          <p>Upload images, set their alt text, replace them everywhere at once, or delete images nothing uses. Use “Choose image” in any editor to place them.</p>
        </div>
        {msg && <span className={`adm-status ${msg.kind}`}>{msg.text}</span>}
      </div>
      {storage && (
        <div className="adm-note">
          <b>Storage: {storage.mode === 'local' ? 'local (development)' : 'cloud'}.</b> {storage.text}
        </div>
      )}
      {writable ? (
        <label
          className={`md-drop${over ? ' over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            upload(e.dataTransfer.files);
          }}
        >
          <input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <b>Drop images here or click to upload</b>
          <div className="fe-hint">JPG, PNG, WebP, SVG or AVIF · max 5 MB · recommended width 1600px</div>
        </label>
      ) : (
        <div className="adm-note">Uploads are disabled here. In production, connect object storage (see README).</div>
      )}
      <div className="adm-actions" style={{ marginBottom: 14 }}>
        {(['all', 'used', 'unused'] as const).map((k) => (
          <button key={k} className={`adm-btn sm${filter === k ? ' primary' : ''}`} onClick={() => setFilter(k)}>
            {k === 'all' ? `All (${files.length})` : k === 'used' ? 'In use' : 'Unused'}
          </button>
        ))}
      </div>
      <div className="md-grid">
        {shown.map((f) => (
          <div className="md-item" key={f.url}>
            <div className="pv" style={{ backgroundImage: `url(${f.url})` }} />
            <div className="meta">
              <b>{f.name}</b>
              <span>
                {f.folder} · {(f.size / 1024).toFixed(0)} KB
              </span>
              <span className="fe-hint" title={f.usedIn.map((u) => `${u.collection} › ${u.field}`).join('\n')}>
                {f.usedIn.length ? `Used in ${f.usedIn.length} place${f.usedIn.length === 1 ? '' : 's'}: ${[...new Set(f.usedIn.map((u) => u.collection))].join(', ')}` : 'Not used'}
              </span>
              <input
                className="md-alt"
                type="text"
                placeholder="Alt text (describe the image)"
                defaultValue={f.alt}
                key={f.url + f.alt}
                disabled={!writable}
                onBlur={(e) => saveAlt(f, e.target.value)}
              />
              <div className="md-act">
                <button className="adm-btn sm" onClick={() => copy(f.url)}>
                  Copy path
                </button>
                {writable && (
                  <label className="adm-btn sm">
                    <input type="file" accept="image/*" hidden onChange={(e) => replace(f, e.target.files)} />
                    Replace
                  </label>
                )}
                {writable && (
                  <button
                    className="adm-btn sm danger"
                    disabled={f.usedIn.length > 0}
                    title={f.usedIn.length ? 'Remove it from the content first, or use Replace' : 'Delete this file'}
                    onClick={() => remove(f)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
