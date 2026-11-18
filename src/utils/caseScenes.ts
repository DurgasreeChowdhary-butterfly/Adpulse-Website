import type { CaseVisual } from '@/types/content';

/**
 * Built-in SVG illustrations for case study cards.
 * Used until a real project image is added (case-studies.json -> items[].image).
 * `k` makes gradient ids unique when several scenes are on one page.
 */
export function caseScene(type: CaseVisual, k: string): string {
  const bg = `<defs><linearGradient id="o${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FC580C" stop-opacity=".4"/><stop offset="1" stop-color="#FC580C" stop-opacity="0"/></linearGradient></defs>`;
  const scenes: Record<CaseVisual, () => string> = {
    bars: () =>
      [50, 70, 64, 96, 124, 118, 160, 200]
        .map((h, i) => `<rect x="${250 + i * 36}" y="${300 - h}" width="22" height="${h}" rx="4" fill="${i === 7 ? '#FC580C' : 'rgba(120,155,230,.32)'}"/>`)
        .join(''),
    line: () =>
      `<path d="M200 290 C260 282 300 266 350 240 S430 170 470 130 S530 70 560 50 V350 H200Z" fill="url(#o${k})"/><path d="M200 290 C260 282 300 266 350 240 S430 170 470 130 S530 70 560 50" fill="none" stroke="#FD6D12" stroke-width="3"/>`,
    map: () =>
      `<g stroke="rgba(150,180,240,.18)" fill="none" stroke-width="1.5"><path d="M200 90 Q340 150 560 120"/><path d="M180 230 Q360 200 560 250"/><path d="M340 0 Q380 180 320 350"/><path d="M470 0 Q450 200 500 350"/></g>` +
      [
        [380, 150, 1],
        [450, 230, 0],
        [510, 170, 0],
        [330, 250, 0],
        [520, 290, 0],
      ]
        .map(
          ([x, y, m]) =>
            `<circle cx="${x}" cy="${y}" r="${m ? 26 : 14}" fill="${m ? 'rgba(252,88,12,.22)' : 'rgba(120,155,230,.2)'}"/><circle cx="${x}" cy="${y}" r="${m ? 8 : 5}" fill="${m ? '#FC580C' : '#7FA2EC'}"/>`,
        )
        .join(''),
    phone: () =>
      `<g transform="translate(350 40) rotate(6)"><rect width="150" height="290" rx="24" fill="#0E1A36" stroke="rgba(255,255,255,.2)" stroke-width="2"/><rect x="10" y="12" width="130" height="266" rx="16" fill="#fff"/><rect x="20" y="28" width="110" height="86" rx="8" fill="#2E4E98"/><rect x="20" y="126" width="86" height="8" rx="4" fill="#01286D"/><rect x="20" y="142" width="64" height="6" rx="3" fill="#B8C2D8"/><rect x="20" y="226" width="110" height="30" rx="10" fill="#FC580C"/></g>`,
  };
  const draw = scenes[type] ?? scenes.bars;
  return `<svg viewBox="0 0 560 350" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg}${draw()}</svg>`;
}
