import type { Theme } from '../theme';

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
export const SANS = 'ui-sans-serif, system-ui, &quot;Segoe UI&quot;, &quot;PingFang SC&quot;, &quot;Microsoft YaHei&quot;, sans-serif';
export const TOTAL_SHEETS = 10;

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function truncate(s: string, max: number): string {
  const chars = Array.from(s);
  return chars.length > max ? chars.slice(0, max).join('') + '…' : s;
}

/** Inline style that delays the shared `in` animation; elements stay visible when motion is reduced. */
export function delay(seconds: number): string {
  return `style="animation-delay:${seconds.toFixed(2)}s"`;
}

const BASE_CSS = `
  .in { animation: in .45s ease-out both; }
  .rise { animation: rise .5s ease-out both; }
  .grow { animation: grow .6s ease-out both; transform-box: fill-box; transform-origin: left center; }
  .pulse { animation: pulse 2.2s ease-in-out infinite; }
  .blink { animation: blink 1s steps(1) infinite; }
  .dash { stroke-dasharray: 5 9; animation: flow 1.8s linear infinite; }
  .scan { animation: scan 6s ease-in-out infinite; }
  @keyframes in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes pulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
  @keyframes blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
  @keyframes flow { to { stroke-dashoffset: -56; } }
  @keyframes scan { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .2; } 100% { transform: translateY(var(--scan-h, 260px)); opacity: 0; } }
`;

const REDUCED_CSS = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; }
    .hide-reduced { display: none; }
  }
`;

export interface FrameOptions {
  theme: Theme;
  width: number;
  height: number;
  sheet?: number;
  title?: string;
  body: string;
  css?: string;
  defs?: string;
  scan?: boolean;
  label?: string;
}

export function frame(o: FrameOptions): string {
  const { theme: t, width: w, height: h } = o;
  const inset = 12;
  const iw = w - inset * 2;
  const ih = h - inset * 2;
  const corner = Math.min(32, Math.floor(Math.min(w, h) / 6));
  const [b0, b1, b2] = t.beam;

  const corners = [
    `M${inset} ${inset + corner}V${inset}H${inset + corner}`,
    `M${w - inset} ${inset + corner}V${inset}H${w - inset - corner}`,
    `M${inset} ${h - inset - corner}V${h - inset}H${inset + corner}`,
    `M${w - inset} ${h - inset - corner}V${h - inset}H${w - inset - corner}`,
  ]
    .map((d) => `<path d="${d}"/>`)
    .join('');

  const scan = o.scan
    ? `<rect class="scan hide-reduced" x="${inset}" y="${inset}" width="${iw}" height="14" fill="url(#beam)" opacity="0" style="--scan-h:${ih - 14}px"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(o.label ?? o.title ?? 'endlessYoung')}">
<defs>
  <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${b0}"/><stop offset="50%" stop-color="${b1}"/><stop offset="100%" stop-color="${b2}"/>
  </linearGradient>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
    <path d="M24 0H0V24" fill="none" stroke="${t.grid}" stroke-width="${t.glow ? 0.7 : 0.5}" ${t.glow ? '' : 'stroke-opacity="0.6"'}/>
  </pattern>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="${t.glow ? 3.5 : 0}" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  ${o.defs ?? ''}
</defs>
<style>${BASE_CSS}${o.css ?? ''}${REDUCED_CSS}</style>
<rect width="${w}" height="${h}" fill="${t.bg}"/>
<rect x="${inset}" y="${inset}" width="${iw}" height="${ih}" fill="url(#grid)" stroke="${t.line}" stroke-width="1"/>
<g fill="none" stroke="url(#beam)" stroke-width="2">${corners}</g>
${scan}
${o.body}
${t.name === 'light' ? titleBlock(t, w, h, inset, o.sheet, o.title) : ''}
</svg>`;
}

function titleBlock(t: Theme, w: number, h: number, inset: number, sheet?: number, title?: string): string {
  const bw = 300;
  const bh = 34;
  const x = w - inset - bw;
  const y = h - inset - bh;
  const sheetText = sheet ? `SHEET ${sheet} / ${TOTAL_SHEETS}` : 'SHEET —';
  return `<g font-family="${MONO}" font-size="9" fill="${t.muted}" letter-spacing="1">
  <rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${t.bg}" stroke="${t.line}" stroke-width="1"/>
  <line x1="${x}" y1="${y + bh / 2}" x2="${x + bw}" y2="${y + bh / 2}" stroke="${t.line}" stroke-width="0.6"/>
  <line x1="${x + 170}" y1="${y}" x2="${x + 170}" y2="${y + bh}" stroke="${t.line}" stroke-width="0.6"/>
  <text x="${x + 8}" y="${y + 12}">DRAWN BY endlessYoung</text>
  <text x="${x + 178}" y="${y + 12}">${sheetText}</text>
  <text x="${x + 8}" y="${y + 29}" fill="${t.text}">${esc(title ?? '')}</text>
  <text x="${x + 178}" y="${y + 29}">SCALE 1:1</text>
</g>`;
}

/** Horizontal dimension line used for blueprint flavor. Renders nothing in dark theme. */
export function dimension(t: Theme, x1: number, x2: number, y: number, label: string): string {
  if (t.name !== 'light') return '';
  const mid = (x1 + x2) / 2;
  return `<g stroke="${t.line}" stroke-width="0.6" fill="none" opacity="0.8">
  <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>
  <line x1="${x1}" y1="${y - 4}" x2="${x1}" y2="${y + 4}"/>
  <line x1="${x2}" y1="${y - 4}" x2="${x2}" y2="${y + 4}"/>
</g>
<text x="${mid}" y="${y - 4}" text-anchor="middle" font-family="${MONO}" font-size="8" fill="${t.muted}">${esc(label)}</text>`;
}
