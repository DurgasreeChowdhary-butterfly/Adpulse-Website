import sharp from "sharp";

/*
 * Neutral, clearly labelled placeholder images for seeding. They are plain
 * grey cards with text, never imitations of real logos or photos.
 */

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function placeholderPng(width: number, height: number, title: string, subtitle = "Placeholder – replace in Media library") {
  const titleSize = Math.round(Math.min(width / 14, height / 5));
  const subSize = Math.round(titleSize * 0.45);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#E5E7EB"/>
      <rect x="${titleSize / 3}" y="${titleSize / 3}" width="${width - (titleSize * 2) / 3}" height="${height - (titleSize * 2) / 3}"
        fill="none" stroke="#9CA3AF" stroke-width="${Math.max(2, titleSize / 12)}" stroke-dasharray="${titleSize / 2} ${titleSize / 3}" rx="${titleSize / 3}"/>
      <text x="50%" y="${height / 2 - subSize * 0.4}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="${titleSize}" font-weight="700" fill="#4B5563">${escape(title)}</text>
      <text x="50%" y="${height / 2 + subSize * 1.6}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-size="${subSize}" fill="#6B7280">${escape(subtitle)}</text>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
