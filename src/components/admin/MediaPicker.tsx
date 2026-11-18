'use client';

import { useState } from 'react';

type MediaFile = { url: string; name: string; alt: string };

/** "Choose image" control: pick from the media library or upload a new image in place. */
export function MediaPicker({ onPick }: { onPick: (url: string, alt: string) => void }) {
  const [files, setFiles] = useState<MediaFile[] | null>(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/admin/media');
    setFiles((await res.json()).files);
  }

  async function toggle() {
    if (!open) await load();
    setOpen((o) => !o);
  }

  async function upload(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setMsg('Uploading…');
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/admin/media', { method: 'POST', body });
    const json = await res.json();
    if (!res.ok) return setMsg(json.error || 'Upload failed');
    setMsg(null);
    onPick(json.url, '');
    setOpen(false);
  }

  return (
    <span style={{ position: 'relative' }}>
      <button type="button" className="adm-btn sm" onClick={toggle}>
        Choose image
      </button>
      {open && files && (
        <span
          style={{
            position: 'absolute',
            zIndex: 20,
            top: '110%',
            left: 0,
            width: 'min(340px, calc(100vw - 48px))',
            maxHeight: 320,
            overflow: 'auto',
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: 8,
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 6,
            boxShadow: '0 20px 40px -20px rgba(6,13,36,.4)',
          }}
        >
          <label className="adm-btn sm" style={{ gridColumn: '1/-1', justifyContent: 'center' }}>
            <input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files)} />
            {msg ?? '+ Upload new image'}
          </label>
          {files.map((f) => (
            <button
              type="button"
              key={f.url}
              title={f.alt ? `${f.name} — ${f.alt}` : f.name}
              onClick={() => {
                onPick(f.url, f.alt);
                setOpen(false);
              }}
              style={{ aspectRatio: '4/3', border: '1px solid var(--line)', borderRadius: 8, background: `var(--mist) url(${f.url}) center/cover` }}
            />
          ))}
        </span>
      )}
    </span>
  );
}
