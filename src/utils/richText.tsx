import { Fragment, type ReactNode } from 'react';

/**
 * Tiny inline markup so editors can style headings from the admin panel
 * without writing HTML:
 *
 *   *word*     -> orange accent            (<span class="accent">)
 *   **word**   -> bold                     (<b>)
 *   _phrase_   -> orange emphasis          (<em>)  used for the About "wipe" reveal
 *   ==word==   -> highlighted word + line  (<span class="hl">)
 *   |          -> line break on desktop    (<span class="br">)
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|==[^=]+==|\s*\|\s*)/g;

export function rich(text: string): ReactNode {
  return text.split(TOKEN).map((part, i) => {
    if (!part) return null;
    if (/^\s*\|\s*$/.test(part)) {
      return (
        <Fragment key={i}>
          {' '}
          <span className="br" />
        </Fragment>
      );
    }
    if (part.startsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith('==')) return <span key={i} className="hl">{part.slice(2, -2)}</span>;
    if (part.startsWith('*')) return <span key={i} className="accent">{part.slice(1, -1)}</span>;
    if (part.startsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Same text with all markup removed (for metadata and aria labels). */
export function plain(text: string): string {
  return text
    .replace(/\s*\|\s*/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/==([^=]+)==/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1');
}
