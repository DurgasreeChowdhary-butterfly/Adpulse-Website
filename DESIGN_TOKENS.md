# AdPulse Design Tokens

Source of truth for every visual value on the site. The tokens are implemented in
[src/app/globals.css](src/app/globals.css) (Tailwind v4 `@theme`). Change values there, then update this file.

## How these were measured

- `design/homepage-design.png` is **1024 × 1536 px**. Content runs from x≈32 to x≈994, so it is **962 px wide**.
- Reference build viewport is **1280 px**, with a **1200 px container**: 962 × 1.25 ≈ 1200. All "Build" values below are
  **mockup px × 1.25**, rounded to a sensible step.
- Colours were sampled with a script (sharp). Surfaces use the region median. Text and icons use the median of the solid
  "core" pixels, which ignores anti-aliasing.
- The mockup is an AI-rendered image: edges are soft, text is partly garbled, and some values vary slightly between
  repeated elements. Where repeated elements disagreed, the most common value won.
- `design/banners.png` is 2172 × 724 and holds 3 slides of about 724 px each. Banner colours match the homepage hero.

## Colours

| Token | Hex | Measured from |
| --- | --- | --- |
| `navy-500` | `#01286D` | Logo navy (exact, from logo PDF) |
| `navy-800` | `#00204F` | Hero background (left side) |
| `navy-900` | `#001D42` | Footer, footer bottom bar, Why bar (`#002046`), CTA band (`#012250`) |
| `orange-400` | `#F88021` | Hero accent headline "Measurable Growth", gradient start |
| `orange-500` | `#FD5E0A` | Header CTA `#FD5E05`, stat numbers `#FD570B`, "View All" links `#FE5F20`, active nav `#FE5E17` |
| `orange-600` | `#FC580C` | Logo orange (exact, from logo PDF), gradient end |
| `orange-100` | `#FDE1CE` | Eyebrow pill background ("About AdPulse", "Case Studies") |
| `red-600` | `#DC100C` | Eyebrow pill text |
| `ink` | `#070A32` | Headings `#060731`, body `#070A32`, nav `#060936` |
| `ink-muted` | `#0B1134` | Small metric labels |
| `on-dark` | `#FFFFFF` | Headings and buttons on navy |
| `on-dark-muted` | `#E5E7EE` | Footer links `#E7E8EE`, footer body `#E0E3E9` |
| `page` | `#FFFFFF` | Page background (`#FEFEFE` measured) |
| `surface-alt` | `#F9FBFE` | Trusted-by bar |
| `card` | `#F6F8FC` | Service, case-study, industry and testimonial cards |
| `line` | `#E4E9F1` | Card borders, vertical dividers (`#E4E9F1` / `#E8EBF1`) |

**Gradients**
- Primary button: `linear-gradient(90deg, #F88021 → #FC580C)`. Hero button measured `#FD6A13` (left) and `#FD6B17` (right).
  Use the `bg-brand-gradient` utility.
- Hero background: navy `#00204F` with an orange swoosh at the bottom right. This is banner artwork, not CSS.

## Typography

**Font: Plus Jakarta Sans** (Google Fonts, loaded with `next/font`). This is the closest match to the mockup's geometric
grotesque, with bold rounded headings and double-storey "a". Weights loaded: 400, 500, 600, 700, 800.

| Role | Mockup px | Build px | Weight | Line height | Token |
| --- | --- | --- | --- | --- | --- |
| Hero H1 | ~40 | 50 | 800 | 1.04 | `text-display` |
| Section H2 ("A Growth-Focused…", "Real Results…") | ~22 | 28 | 800 | 1.2 | `text-h2` |
| Card title (service, case study) | ~17–18 | 22 | 700–800 | 1.18 | `text-h3` |
| Stat number (100+, 3.5x, +312%) | ~21 | 26 | 800 | 1.1 | `text-stat` |
| Hero subtitle | ~18 | 22 | 500 | 1.3 | `text-lead` |
| Hero pill ("Performance Marketing") | ~16 | 20 | 600 | 1 | — |
| Body / nav / footer links | ~12 | 15 | 400 body, 600 nav | 1.45 | `text-body` |
| Eyebrow pill text | ~11 | 14 | 600 | 1 | `text-eyebrow` |
| Stat / metric labels | ~11 | 14 | 500 | 1.25 | `text-label` |
| Header button | ~12 | 15 | 600 | — | `text-body` |
| Hero / CTA button | ~16 | 20 | 600 | — | — |

## Radii

| Element | Mockup px | Build px | Token |
| --- | --- | --- | --- |
| Header CTA, "Book a Strategy Call" button | ~6 | 8 | `rounded-btn` |
| Hero CTA button | full | full | `rounded-pill` |
| Eyebrow pills, case-study tags, hero pill | full | full | `rounded-pill` |
| Service / case / industry / testimonial / Google cards | ~10 | 12 | `rounded-card` |
| About image | ~10 | 12 | `rounded-card` |
| "Why AdPulse" bar, CTA band | ~16 | 20 | `rounded-band` |
| Slider arrows, case-study arrow buttons | circle | circle | `rounded-full` |

## Shadows

| Token | Value | Used on |
| --- | --- | --- |
| `shadow-card` | `0 4px 14px rgb(1 29 66 / .08), 0 1px 2px rgb(1 29 66 / .06)` | All light cards. Measured as a soft `#D7DEEA` edge fading over ~8 px below each card |
| `shadow-card-hover` | `0 10px 24px rgb(1 29 66 / .12)` | Card hover (not shown in mockup; subtle) |
| `shadow-btn` | `0 6px 16px rgb(253 94 10 / .3)` | Orange buttons (visible glow under the hero CTA) |

## Layout and spacing

| Item | Mockup px | Build px | Token |
| --- | --- | --- | --- |
| Container width | 962 | 1200 | `--container-site` / `container-site` |
| Side gutter (desktop) | 32 | 40 | `--spacing-gutter` (24 px tablet, 16 px mobile) |
| Header height | 62 | 76 | `--spacing-header` |
| Header logo height | ~44 | 55 | — |
| Active nav underline | ~2 | 3 | orange-500 |
| Hero banner height | 278 | 348 | — |
| Hero slider arrows | 34 ⌀ | 42 ⌀ | white circle, navy chevron |
| Hero dots | ~10 ⌀ | 12 ⌀ | active orange, inactive white |
| Trusted-by bar height | 62 | 78 | `surface-alt` with 1 px `line` dividers |
| Gap between sections | 12–30 | 32–40 | `--spacing-section` = 40 |
| Service cards (3) | ~312 × 105, gap ~14 | 390 × 131, gap 18 | — |
| Service icon | ~40 | 50 | orange line icon |
| Why bar | 962 × 93 | 1200 × 116 | navy-900 + orange swoosh right |
| Case-study cards (3) | ~310 × 117 | 388 × 146 | image 160 × 119 left |
| Industry tiles (8) | ~76 × 56, gap ~10 | 95 × 70, gap 12 | — |
| Testimonial cards | ~245 × 95 | 306 × 119 | — |
| CTA band | 962 × 69 | 1200 × 86 | navy + orange swooshes both ends |
| Footer main | ~150 | 188 | navy-900, 5 columns |
| Footer bottom bar | ~46 | 58 | top divider `rgb(255 255 255 / .2)` |

## Icon style

Orange (`orange-500`) **line icons** with rounded caps, ~2 px stroke at 24 px, slightly heavy. On the Why bar they are
orange on navy. Footer social icons are white outline glyphs inside rounded squares. Lucide is the closest open-source
set. Brand marks (Google "G", WhatsApp, social logos) must use the official brand assets.

## Breakpoints

Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. The 1280 layout is the pixel-exact reference. Below
`xl`, sections reflow (cards stack, nav collapses to a menu) while keeping the same tokens.
