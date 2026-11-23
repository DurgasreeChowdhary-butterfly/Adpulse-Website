'use client';

import { createContext, useContext, useState } from 'react';
import { MediaPicker } from './MediaPicker';

type Json = any;
type Option = { value: string; label: string };

/**
 * Builds an edit form from the shape of the data itself, so new fields added to the JSON
 * (or returned by a future API) appear in the admin automatically.
 * Field-specific hints, labels, choices and defaults live in the maps below.
 */

/** Lists the editor can offer as dropdowns (services, icons...). Provided by ContentEditor. */
export interface EditorRefs {
  collection: string;
  services: Option[];
  icons: string[];
  /** Case-study filter keys, read live from the data being edited */
  categories: Option[];
  /** First item of every list in the original data, keyed by its path without indexes */
  shapes: Record<string, Json>;
}
export const RefsContext = createContext<EditorRefs>({ collection: '', services: [], icons: [], categories: [], shapes: {} });

const HINTS: Record<string, string> = {
  heading: 'Use *word* for orange, | for a line break.',
  title: 'Use *word* for orange, _phrase_ for orange emphasis, ==word== to highlight, | for a line break.',
  line: 'Use **text** for bold.',
  icon: 'Pick an icon from the list.',
  action: 'Choose "Open audit form", or leave as "Link" and fill in Href.',
  href: 'Page link, e.g. /services or /about#why',
  slug: 'Used in the URL. Leave empty to create it from the title.',
  ledBy: 'Service shown as "Led by…" on this industry.',
  visual: 'Built-in illustration used when no image is set.',
  category: 'Filter tab this case study appears under.',
  date: 'YYYY-MM-DD',
  metaTitle: 'Shown in Google and browser tabs. Leave empty to use the page title.',
  metaDescription: 'Shown in Google results. Leave empty to use the page description.',
  related: 'Leave empty to show the next services automatically.',
  services: 'Services delivered on this project.',
  featured: 'Featured case studies are listed first.',
  showOnHome: 'Include in the homepage case-study slider.',
  status: 'Drafts are hidden from the website.',
  visible: 'Untick to hide this item without deleting it.',
  enabled: 'Shows this section on the homepage.',
  isSample: 'Marks placeholder content; the site shows a "sample" note.',
  website: 'Optional, e.g. https://client.com',
  gallery: 'Extra project images, shown on the case study page. Empty = section hidden.',
  client: 'Client or project name, shown on the case study page. Empty = hidden.',
  overview: 'Short introduction to the client, shown on the case study page. Empty = hidden.',
  execution: 'Steps of the work, shown as a numbered list on the case study page. Empty = hidden.',
  homeLabel: 'First link in the header menu and the mobile menu.',
  backToTopLabel: 'Read out by screen readers for the arrow button in the footer.',
  cardLinkLabel: 'Link text on each card.',
  brand: 'Optional uploaded logos. Leave a field empty to use the built-in Adpulse logo there.',
  stat: 'Badge on the service page photo. Leave the value empty to hide it.',
  consentText: 'Short line under the audit and newsletter forms, e.g. By sending this form you agree to our Privacy Policy. Empty = hidden.',
  policyUrl: 'Privacy Policy link used in the consent line, e.g. /privacy',
};

const LABELS: Record<string, string> = {
  showOnHome: 'Show on homepage',
  metaTitle: 'SEO title',
  metaDescription: 'SEO description',
  isSample: 'Sample content',
  ledBy: 'Led by service',
  imageAlt: 'Image alt text',
  coverAlt: 'Cover alt text',
  related: 'Related services',
  otherEmails: 'Other emails',
  ogImage: 'Social share image',
  href: 'Href (link)',
  logoOnDark: 'Logo for dark backgrounds',
  backToTopLabel: 'Back-to-top button label',
};

/** Hints for one specific field, keyed by "<collection>:<path without list indexes>". They win over HINTS. */
const PATH_HINTS: Record<string, string> = {
  'settings:brand.logo': 'Logo for light backgrounds (header once scrolled). Use a wide logo with a transparent background (SVG or PNG). Empty = built-in logo.',
  'settings:brand.logoOnDark': 'Logo for dark backgrounds (header over the dark page tops, mobile menu, footer). Use a light version. Empty = built-in logo.',
  'clients:items.logo': 'Transparent PNG or SVG works best; it is fitted into the same box as the other logos. Style must be "Logo image".',
  'case-studies:section.viewAllLabel': 'Button under the homepage case studies, linking to the Case Studies page.',
  'case-studies:items.summary': 'Short description on the card and under the case study title. Empty = the headline result is shown on the card.',
  'case-studies:items.image': 'Main image on the card and the case study page. Empty = the built-in illustration chosen under Visual.',
};

const STATIC_OPTIONS: Record<string, Option[]> = {
  visual: ['bars', 'line', 'map', 'phone'].map((v) => ({ value: v, label: v })),
  style: [
    { value: 'logo', label: 'Logo image' },
    { value: 'wordmark', label: 'Text wordmark' },
    { value: 'wordmark-alt', label: 'Text wordmark (alt style)' },
    { value: 'placeholder', label: 'Placeholder tile' },
  ],
  status: [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft (hidden)' },
  ],
  action: [
    { value: '', label: 'Link (uses Href)' },
    { value: 'audit', label: 'Open audit form' },
  ],
};

/** Starting values for new items (anything not listed starts empty). */
const DEFAULTS: Record<string, Json> = {
  status: 'draft',
  visible: true,
  showOnHome: true,
  rating: 5,
  style: 'logo',
  visual: 'bars',
  date: () => new Date().toISOString().slice(0, 10),
};

/** Shapes for lists that may start empty, so "+ Add" creates the right kind of item. */
const TEMPLATES: Record<string, Json> = {
  phones: { label: '', number: '' },
  otherEmails: { label: '', address: '' },
  gallery: { image: null, alt: '' },
  related: '',
  services: '',
  metrics: { value: '', label: '' },
  socials: { label: '', icon: '', url: '' },
  body: '',
  execution: '',
};

/** Image fields and the alt field next to them that gets filled from the media library. */
const IMAGE_KEY = /(^image$|image$|^cover$|^logo$|^logoOnDark$|ogImage)/i;
const ALT_FOR: Record<string, string> = { image: 'imageAlt', cover: 'coverAlt' };
const LONG_KEY = /(description|summary|lead|text|excerpt|audience|challenge|solution|overview|quote|about|note|address|line)$/i;

export const humanize = (k: string) =>
  LABELS[k] ??
  k
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

/** Empty copy of a value with the same shape, used when adding list items. */
function blank(v: Json, key = ''): Json {
  if (key in DEFAULTS) return typeof DEFAULTS[key] === 'function' ? DEFAULTS[key]() : DEFAULTS[key];
  if (Array.isArray(v)) return [];
  if (v === null) return null;
  if (typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x, k)]));
  if (typeof v === 'number') return 0;
  if (typeof v === 'boolean') return false;
  return '';
}

function itemLabel(v: Json, i: number, opts?: Option[]): string {
  if (v && typeof v === 'object') {
    const t = v.title ?? v.name ?? v.label ?? v.number ?? v.address ?? v.slug ?? v.text ?? v.quote;
    const tag = v.status === 'draft' ? ' · draft' : v.visible === false ? ' · hidden' : v.featured ? ' · featured' : '';
    if (typeof t === 'string' && t) return t.replace(/[*_=|]/g, '') + tag;
  }
  if (typeof v === 'string' && opts) return opts.find((o) => o.value === v)?.label ?? v;
  return typeof v === 'string' ? v || `Item ${i + 1}` : `Item ${i + 1}`;
}

/** Dropdown choices for a field, if it has any. */
function useOptions(name: string, path: string[]): Option[] | null {
  const refs = useContext(RefsContext);
  if (name === 'ledBy') return [{ value: '', label: '(none)' }, ...refs.services];
  if (name === 'related' || name === 'services') return refs.services;
  if (name === 'category' && refs.collection === 'case-studies' && path[0] === 'items') return refs.categories;
  return STATIC_OPTIONS[name] ?? null;
}

function Select({ value, options, onChange }: { value: string; options: Option[]; onChange: (v: string) => void }) {
  const known = options.some((o) => o.value === value);
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {!known && <option value={value ?? ''}>{value ? `${value} (not found)` : '(choose)'}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface Props {
  name: string;
  value: Json;
  onChange: (v: Json) => void;
  depth?: number;
  /** Keys from the collection root, without list indexes */
  path?: string[];
  /** For image fields: called with the picked file and its library alt text */
  onPick?: (url: string, alt: string) => void;
}

export function FieldEditor({ name, value, onChange, depth = 0, path = [], onPick }: Props) {
  const refs = useContext(RefsContext);
  const label = humanize(name);
  const hint = PATH_HINTS[`${refs.collection}:${path.join('.')}`] ?? HINTS[name];
  const options = useOptions(name, path);

  // Images (string path or null)
  if (IMAGE_KEY.test(name) && (typeof value === 'string' || value === null)) {
    return (
      <div className="fe-field">
        <label>
          {label}
          {hint && <small>{hint}</small>}
        </label>
        <div className="fe-img">
          <div className="pv" style={{ backgroundImage: value ? `url(${value})` : undefined }} />
          <div style={{ display: 'grid', gap: 6 }}>
            <input type="text" value={value ?? ''} placeholder="/images/… or https://…" onChange={(e) => onChange(e.target.value || null)} />
            <div className="row">
              <MediaPicker onPick={(url, alt) => (onPick ? onPick(url, alt) : onChange(url))} />
              {value && (
                <button type="button" className="adm-btn sm" onClick={() => onChange(null)}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div className="fe-field">
        <label className="fe-check">
          <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}
        </label>
        {hint && <span className="fe-hint">{hint}</span>}
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="fe-field">
        <label>{label}</label>
        <input type="number" step="any" value={value} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
      </div>
    );
  }

  if (typeof value === 'string' || value === null) {
    const long = LONG_KEY.test(name) || (value?.length ?? 0) > 90;
    return (
      <div className="fe-field">
        <label>
          {label}
          {hint && <small>{hint}</small>}
        </label>
        {options ? (
          <Select value={value ?? ''} options={options} onChange={onChange} />
        ) : name === 'icon' ? (
          <>
            <input type="text" list="fe-icons" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
            <datalist id="fe-icons">
              {refs.icons.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
          </>
        ) : long ? (
          <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input type={name === 'date' ? 'date' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }

  if (Array.isArray(value)) return <ArrayEditor name={name} value={value} onChange={onChange} depth={depth} path={path} />;

  // Object
  return (
    <div className="fe-obj">
      {depth > 0 && !name.includes('[') && <div className="fe-legend">{label}</div>}
      {depth > 0 && !name.includes('[') && hint && <span className="fe-hint">{hint}</span>}
      {Object.entries(value).map(([k, v]) => {
        // Picking an image from the library also fills its empty alt field.
        const altKey = [ALT_FOR[k], `${k}Alt`, 'alt'].find((a) => a && typeof value[a] === 'string') ?? '';
        const hasAlt = IMAGE_KEY.test(k) && !!altKey;
        return (
          <FieldEditor
            key={k}
            name={k}
            value={v}
            depth={depth + 1}
            path={[...path, k]}
            onChange={(nv) => onChange({ ...value, [k]: nv })}
            onPick={hasAlt ? (url, alt) => onChange({ ...value, [k]: url, [altKey]: value[altKey] || alt }) : undefined}
          />
        );
      })}
    </div>
  );
}

function ArrayEditor({ name, value, onChange, depth, path }: { name: string; value: Json[]; onChange: (v: Json) => void; depth: number; path: string[] }) {
  const refs = useContext(RefsContext);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const options = useOptions(name, path);
  const example = value[value.length - 1] ?? refs.shapes[path.join('.')] ?? TEMPLATES[name];
  const isPrim = example === undefined ? value.every((v) => typeof v !== 'object' || v === null) : typeof example !== 'object' || example === null;
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => {
    if (confirmRemove()) onChange(value.filter((_, k) => k !== i));
  };
  const add = () => {
    onChange([...value, example === undefined ? '' : blank(example)]);
    setOpenIdx(value.length);
  };

  return (
    <div className="fe-field">
      <label>
        {humanize(name)} <small>{value.length} item{value.length === 1 ? '' : 's'}</small>
        {HINTS[name] && <small>{HINTS[name]}</small>}
      </label>
      <div className="fe-arr">
        {value.map((v, i) =>
          isPrim ? (
            <div className="fe-prim" key={i}>
              {options ? (
                <Select value={v ?? ''} options={options} onChange={(nv) => onChange(value.map((x, k) => (k === i ? nv : x)))} />
              ) : (
                <input type="text" value={v ?? ''} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
              )}
              <Ctl onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => remove(i)} />
            </div>
          ) : (
            <details className="fe-item" key={i} open={openIdx === i} onToggle={(e) => (e.currentTarget.open ? setOpenIdx(i) : openIdx === i && setOpenIdx(null))}>
              <summary>
                <span className="t">{itemLabel(v, i)}</span>
                <Ctl onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={() => remove(i)} />
              </summary>
              <div className="fe-body">
                <FieldEditor name={`${name}[${i}]`} value={v} depth={depth + 1} path={path} onChange={(nv) => onChange(value.map((x, k) => (k === i ? nv : x)))} />
              </div>
            </details>
          ),
        )}
        <div>
          <button type="button" className="adm-btn sm" onClick={add}>
            + Add {isPrim ? 'entry' : 'item'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Ctl({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };
  return (
    <span className="ctl">
      <button type="button" className="adm-btn sm" aria-label="Move up" onClick={stop(onUp)}>
        ↑
      </button>
      <button type="button" className="adm-btn sm" aria-label="Move down" onClick={stop(onDown)}>
        ↓
      </button>
      <button type="button" className="adm-btn sm danger" aria-label="Remove" onClick={stop(onRemove)}>
        ✕
      </button>
    </span>
  );
}

function confirmRemove() {
  // window.confirm keeps this dependency-free; swap for a modal in the full admin build.
  return typeof window === 'undefined' ? true : window.confirm('Remove this item?');
}

/** Records the first item of every list in `data`, keyed by path without indexes. */
export function collectShapes(data: Json, path: string[] = [], out: Record<string, Json> = {}): Record<string, Json> {
  if (Array.isArray(data)) {
    if (data.length && !(path.join('.') in out)) out[path.join('.')] = data[0];
    data.forEach((d) => collectShapes(d, path, out));
  } else if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) collectShapes(v, [...path, k], out);
  }
  return out;
}
