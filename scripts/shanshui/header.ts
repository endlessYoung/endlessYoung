import type { Day } from '../data/contributions';
import { BRUSH, SONG, fontFaces } from './fonts';
import { fbm, rng } from './noise';
import type { Palette } from './palette';

const W = 1200;
const H = 420;
const TOP = 28;
const BOTTOM = H - 28;
const BASE = 334;
const CW = 2200;
const PAN = CW - W;
const STEP = 3;
const MAX_H = 236;

const CN_DIGITS = '〇一二三四五六七八九';
const CN_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

export function cnNumber(n: number): string {
  if (n < 10) return CN_DIGITS[n];
  if (n < 20) return '十' + (n % 10 ? CN_DIGITS[n % 10] : '');
  if (n < 100) return CN_DIGITS[Math.floor(n / 10)] + '十' + (n % 10 ? CN_DIGITS[n % 10] : '');
  return String(n)
    .split('')
    .map((d) => CN_DIGITS[Number(d)])
    .join('');
}

export interface HeaderInput {
  days: Day[];
  /** short poetic line that changes with the hour */
  verse: string;
}

interface Peak {
  x: number;
  h: number;
  day: Day;
}

/** Oldest day sits at the right edge: a handscroll is read from right to left. */
function dayX(i: number, n: number): number {
  return CW - 70 - (i * (CW - 140)) / Math.max(1, n - 1);
}

function heights(days: Day[], seed: number): { hs: number[]; peak?: Peak } {
  const rand = rng(seed);
  const kernels = days
    .map((d, i) => ({ d, x: dayX(i, days.length), a: d.count > 0 ? 30 * d.count ** 0.55 * (0.85 + rand() * 0.3) : 0, s: 13 + rand() * 9 }))
    .filter((k) => k.a > 0);

  const rough = fbm(seed + 7, 5);
  const crags = fbm(seed + 17, 3);
  const hs: number[] = [];
  const tallest = Math.max(1, ...kernels.map((k) => k.a));
  for (let x = 0; x <= CW; x += STEP) {
    let sum = 0;
    let top = 0;
    for (const k of kernels) {
      const dist = Math.abs(x - k.x);
      if (dist < k.s * 9) {
        const v = k.a * Math.exp(-dist / k.s);
        sum += v;
        top = Math.max(top, v);
      }
    }
    const merged = top + 0.18 * (sum - top);
    const compressed = (MAX_H * 0.82 * merged) / (tallest * 1.25);
    const texture = rough(x / 23) * (3 + compressed * 0.11);
    const spires = Math.max(0, crags(x / 9)) ** 1.6 * compressed * 0.32;
    hs.push(Math.max(0, compressed + texture + spires));
  }

  let peak: Peak | undefined;
  for (const k of kernels) {
    if (!peak || k.d.count > peak.day.count) peak = { x: k.x, h: 0, day: k.d };
  }
  if (peak) {
    const centre = Math.round(peak.x / STEP);
    let best = centre;
    for (let i = Math.max(0, centre - 8); i <= Math.min(hs.length - 1, centre + 8); i++) if (hs[i] > hs[best]) best = i;
    peak.x = best * STEP;
    peak.h = hs[best];
  }
  return { hs, peak };
}

function areaPath(hs: number[], base: number, scale = 1, shift = 0): string {
  const pts = hs.map((h, i) => `${(i * STEP + shift).toFixed(1)},${(base - h * scale).toFixed(1)}`);
  return `M${shift},${base} L${pts.join(' L')} L${CW + shift},${base} Z`;
}

function ridgeLine(hs: number[], base: number, minH = 2): string {
  const segs: string[] = [];
  let cur: string[] = [];
  hs.forEach((h, i) => {
    if (h > minH) cur.push(`${i * STEP},${(base - h).toFixed(1)}`);
    else if (cur.length) {
      if (cur.length > 2) segs.push(`M${cur.join(' L')}`);
      cur = [];
    }
  });
  if (cur.length > 2) segs.push(`M${cur.join(' L')}`);
  return segs.join(' ');
}

/** Contour strokes inside each mountain, standing in for texture strokes (皴). */
function cunStrokes(hs: number[], seed: number): string {
  const wobble = fbm(seed + 31, 3);
  const levels = [0.8, 0.62, 0.46, 0.3];
  return levels
    .map((f, li) => {
      const segs: string[] = [];
      let cur: string[] = [];
      hs.forEach((h, i) => {
        const x = i * STEP;
        const hh = h * f + wobble(x / 17 + li * 9) * 5;
        if (h > 26 && hh > 10 && wobble(x / 40 + li * 3) > -0.25) cur.push(`${x},${(BASE - hh).toFixed(1)}`);
        else if (cur.length) {
          if (cur.length > 3) segs.push(`M${cur.join(' L')}`);
          cur = [];
        }
      });
      if (cur.length > 3) segs.push(`M${cur.join(' L')}`);
      return segs.join(' ');
    })
    .join(' ');
}

function mossDots(hs: number[], p: Palette, seed: number): string {
  const rand = rng(seed + 53);
  const dots: string[] = [];
  for (let i = 0; i < hs.length; i++) {
    if (hs[i] < 34 || rand() > 0.16) continue;
    const x = i * STEP;
    const y = BASE - hs[i];
    for (let k = 0; k < 2 + Math.floor(rand() * 2); k++) {
      dots.push(`<ellipse cx="${(x + (rand() - 0.5) * 6).toFixed(1)}" cy="${(y + 1 + rand() * 4).toFixed(1)}" rx="${(1 + rand()).toFixed(1)}" ry="${(0.8 + rand() * 0.8).toFixed(1)}"/>`);
    }
  }
  return `<g fill="${p.moss}" opacity="${p.mode === 'light' ? 0.85 : 0.6}">${dots.join('')}</g>`;
}

function pine(x: number, y: number, s: number, p: Palette): string {
  const tiers = [0, 1, 2]
    .map((t) => {
      const ty = y - s * (0.55 + t * 0.32);
      const w = s * (0.5 - t * 0.12);
      return `<path d="M${(x - w).toFixed(1)},${(ty + s * 0.12).toFixed(1)} Q${x},${(ty - s * 0.18).toFixed(1)} ${(x + w).toFixed(1)},${(ty + s * 0.12).toFixed(1)} Z"/>`;
    })
    .join('');
  return `<line x1="${x}" y1="${y}" x2="${x}" y2="${(y - s * 1.3).toFixed(1)}" stroke="${p.ink}" stroke-width="${(s * 0.07).toFixed(2)}"/><g fill="${p.mode === 'light' ? '#2E5A4A' : '#24463D'}">${tiers}</g>`;
}

function pavilion(x: number, y: number, p: Palette): string {
  const roof = `M${(x - 15).toFixed(1)},${(y - 17).toFixed(1)} Q${x},${(y - 21).toFixed(1)} ${(x + 15).toFixed(1)},${(y - 17).toFixed(1)} L${(x + 8).toFixed(1)},${(y - 24).toFixed(1)} L${x.toFixed(1)},${(y - 29).toFixed(1)} L${(x - 8).toFixed(1)},${(y - 24).toFixed(1)} Z`;
  return `<g stroke="${p.ink}" stroke-width="0.8">
  <line x1="${(x - 8).toFixed(1)}" y1="${y}" x2="${(x - 8).toFixed(1)}" y2="${(y - 18).toFixed(1)}"/>
  <line x1="${(x + 8).toFixed(1)}" y1="${y}" x2="${(x + 8).toFixed(1)}" y2="${(y - 18).toFixed(1)}"/>
  <path d="${roof}" fill="${p.cinnabar}" fill-opacity="${p.mode === 'light' ? 0.85 : 0.7}"/>
  <line x1="${(x - 11).toFixed(1)}" y1="${y}" x2="${(x + 11).toFixed(1)}" y2="${y}"/>
</g>`;
}

function banks(p: Palette, seed: number): string {
  const rand = rng(seed + 77);
  const n = fbm(seed + 91, 4);
  const pieces: string[] = [];
  const trees: string[] = [];
  for (let x0 = 40; x0 < CW; x0 += 260 + rand() * 260) {
    const w = 120 + rand() * 160;
    const pts: string[] = [];
    for (let x = 0; x <= w; x += 4) {
      const t = x / w;
      const h = Math.sin(Math.PI * t) ** 0.7 * (10 + rand() * 0.5 + 12 * (n((x0 + x) / 30) + 1));
      pts.push(`${(x0 + x).toFixed(1)},${(BASE + 14 - h).toFixed(1)}`);
    }
    pieces.push(`<path d="M${x0},${BASE + 14} L${pts.join(' L')} L${x0 + w},${BASE + 14} Z"/>`);
    if (rand() < 0.4) trees.push(pavilion(x0 + w * 0.62, BASE + 2, p));
    const count = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < count; k++) {
      const tx = x0 + w * (0.25 + rand() * 0.5);
      trees.push(pine(Number(tx.toFixed(1)), BASE + 4 - rand() * 6, 14 + rand() * 12, p));
    }
  }
  return `<g fill="${p.mode === 'light' ? '#4E6F57' : '#1E3530'}" stroke="${p.ink}" stroke-width="0.6" stroke-opacity="0.5">${pieces.join('')}</g>${trees.join('')}`;
}

function farRange(p: Palette, seed: number, base: number, amp: number, opacity: number): string {
  const n = fbm(seed, 5);
  const pts: string[] = [];
  for (let x = 0; x <= CW; x += 6) {
    const h = amp * (0.55 + 0.45 * n(x / 140)) + 14 * n(x / 31);
    pts.push(`${x},${(base - Math.max(6, h)).toFixed(1)}`);
  }
  return `<path d="M0,${base} L${pts.join(' L')} L${CW},${base} Z" fill="${p.far}" opacity="${opacity}" filter="url(#soft)"/>`;
}

function mist(p: Palette, seed: number): string {
  const rand = rng(seed + 13);
  const puffs: string[] = [];
  for (let x = 0; x < CW; x += 140 + rand() * 120) {
    puffs.push(`<ellipse cx="${x.toFixed(0)}" cy="${(BASE - 30 - rand() * 60).toFixed(0)}" rx="${(110 + rand() * 120).toFixed(0)}" ry="${(10 + rand() * 12).toFixed(0)}"/>`);
  }
  return `<g class="mist" fill="${p.mist}" opacity="${p.mode === 'light' ? 0.7 : 0.55}" filter="url(#cloud)">${puffs.join('')}</g>`;
}

function peakLabel(peak: Peak, p: Palette): string {
  const month = CN_MONTHS[Number(peak.day.date.slice(5, 7)) - 1];
  const day = cnNumber(Number(peak.day.date.slice(8, 10)));
  const chars = Array.from(`${month}月${day}日`);
  const counts = Array.from(`峰${cnNumber(peak.day.count)}`);
  const x = peak.x + 16;
  const top = Math.max(TOP + 16, BASE - peak.h - 20);
  const colH = Math.max(chars.length, counts.length) * 14 + 12;
  const col = (cs: string[], cx: number) => cs.map((c, i) => `<text x="${cx}" y="${top + 16 + i * 14}">${c}</text>`).join('');
  return `<g font-family="${SONG}" font-size="12" text-anchor="middle" fill="${p.inscription}">
  <rect x="${x - 8}" y="${top}" width="34" height="${colH}" fill="${p.mode === 'light' ? '#E9DEC2' : '#1F2B37'}" stroke="${p.inscription}" stroke-opacity="0.45" stroke-width="0.6"/>
  ${col(chars, x + 18)}${col(counts, x + 3)}
</g>`;
}

function seal(x: number, y: number, size: number, p: Palette, chars: [string, string, string, string]): string {
  const half = size / 2;
  const fs = size * 0.42;
  const [a, b, c, d] = chars;
  return `<g transform="rotate(-2 ${x + half} ${y + half})" filter="url(#stamp)">
  <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2" fill="${p.cinnabar}"/>
  <g font-family="${BRUSH}" font-size="${fs.toFixed(1)}" fill="${p.mode === 'light' ? '#F4E9D2' : '#1A1210'}" text-anchor="middle">
    <text x="${x + half * 1.5}" y="${y + half * 0.86}">${a}</text>
    <text x="${x + half * 1.5}" y="${y + half * 1.82}">${b}</text>
    <text x="${x + half * 0.5}" y="${y + half * 0.86}">${c}</text>
    <text x="${x + half * 0.5}" y="${y + half * 1.82}">${d}</text>
  </g>
</g>`;
}

function verticalText(text: string, x: number, y: number, size: number, gap: number, family: string, fill: string): string {
  return Array.from(text)
    .map((c, i) => `<text x="${x}" y="${(y + i * (size + gap)).toFixed(1)}" font-family="${family}" font-size="${size}" fill="${fill}" text-anchor="middle">${c}</text>`)
    .join('');
}

export async function render(p: Palette, input: HeaderInput): Promise<string> {
  const seed = 20261010;
  const { hs, peak } = heights(input.days, seed);
  const backHs = hs.map((h, i) => h * 0.72 + 18 * Math.max(0, fbm(seed + 3)(i / 60)));

  const title = '少年游';
  const colophon = '以一年提交为山';
  const verse = input.verse;
  const caption = 'endlessYoung · Android Framework · Compose · Agents';
  const sealChars: [string, string, string, string] = ['永', '远', '少', '年'];
  const peakChars = peak ? `${CN_MONTHS.join('')}月日峰${cnNumber(peak.day.count)}${cnNumber(Number(peak.day.date.slice(8, 10)))}` : '';

  const faces = await fontFaces({
    [BRUSH]: title + sealChars.join('') + '印',
    [SONG]: colophon + verse + caption + peakChars,
  });

  const light = p.mode === 'light';
  const reflection = `<g opacity="${light ? 0.12 : 0.18}" transform="translate(0 ${BASE * 2}) scale(1 -1)" filter="url(#soft)"><path d="${areaPath(hs, BASE)}" fill="${light ? p.azurite : p.ridge}"/></g>`;

  const moon = light
    ? ''
    : `<g><circle cx="210" cy="96" r="54" fill="url(#halo)"/><circle cx="210" cy="96" r="22" fill="#E9DDB8"/><circle cx="218" cy="90" r="20" fill="#E9DDB8" opacity="0.35"/></g>`;

  const birds = [0, 1, 2]
    .map((i) => `<path d="M${330 + i * 22},${88 + (i % 2) * 9} q5,-5 9,0 q4,-5 9,0" fill="none" stroke="${p.inscription}" stroke-width="1.1" stroke-linecap="round" opacity="0.7"/>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="少年游 — a year of commits painted as a blue-green landscape">
<defs>
  <style>
  ${faces}
  .pan { animation: pan 90s ease-in-out infinite alternate; }
  .mist { animation: drift 26s ease-in-out infinite alternate; }
  .boat { animation: sail 70s linear infinite; }
  .birds { animation: fly 40s linear infinite; }
  .ripple { animation: ripple 9s linear infinite; }
  @keyframes pan { from { transform: translateX(-${PAN}px); } to { transform: translateX(0); } }
  @keyframes drift { from { transform: translateX(-40px); } to { transform: translateX(40px); } }
  @keyframes sail { from { transform: translateX(-120px); } to { transform: translateX(${W + 120}px); } }
  @keyframes fly { from { transform: translate(0, 0); } to { transform: translate(${W}px, -30px); } }
  @keyframes ripple { from { transform: translateX(0); } to { transform: translateX(-24px); } }
  @media (prefers-reduced-motion: reduce) {
    .pan, .mist, .boat, .birds, .ripple { animation: none !important; }
    .boat { transform: translateX(520px); }
  }
  </style>
  <clipPath id="painting"><rect x="0" y="${TOP}" width="${W}" height="${BOTTOM - TOP}"/></clipPath>
  <clipPath id="waterClip"><rect x="0" y="${BASE}" width="${CW}" height="${BOTTOM - BASE}"/></clipPath>
  <radialGradient id="aged" cx="50%" cy="45%" r="75%">
    <stop offset="55%" stop-color="${p.silk}"/>
    <stop offset="100%" stop-color="${p.silkEdge}"/>
  </radialGradient>
  <radialGradient id="halo"><stop offset="0%" stop-color="#E9DDB8" stop-opacity="0.35"/><stop offset="100%" stop-color="#E9DDB8" stop-opacity="0"/></radialGradient>
  <linearGradient id="pigment" gradientUnits="userSpaceOnUse" x1="0" y1="${BASE - 170}" x2="0" y2="${BASE - 20}">
    <stop offset="0%" stop-color="${p.azurite}"/>
    <stop offset="55%" stop-color="${p.malachite}"/>
    <stop offset="100%" stop-color="${p.malachite}"/>
  </linearGradient>
  <linearGradient id="foot" gradientUnits="userSpaceOnUse" x1="0" y1="${BASE - 58}" x2="0" y2="${BASE}">
    <stop offset="0%" stop-color="${p.ochre}" stop-opacity="0"/>
    <stop offset="55%" stop-color="${p.ochre}" stop-opacity="0.75"/>
    <stop offset="100%" stop-color="${p.ochreFoot}" stop-opacity="1"/>
  </linearGradient>
  <pattern id="brocade" width="14" height="14" patternUnits="userSpaceOnUse">
    <path d="M7,1 L13,7 L7,13 L1,7 Z" fill="none" stroke="${p.thread}" stroke-width="0.6" stroke-opacity="0.35"/>
    <circle cx="7" cy="7" r="1" fill="${p.thread}" fill-opacity="0.4"/>
  </pattern>
  <linearGradient id="pigmentBack" gradientUnits="userSpaceOnUse" x1="0" y1="${BASE - MAX_H}" x2="0" y2="${BASE}">
    <stop offset="0%" stop-color="${p.azurite}" stop-opacity="0.75"/>
    <stop offset="60%" stop-color="${p.malachite}" stop-opacity="0.55"/>
    <stop offset="100%" stop-color="${p.ochre}" stop-opacity="0.4"/>
  </linearGradient>
  <linearGradient id="waterWash" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${p.water}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="${p.water}" stop-opacity="0.4"/>
  </linearGradient>
  <pattern id="waves" width="24" height="9" patternUnits="userSpaceOnUse">
    <path d="M0,6 q6,-5 12,0 t12,0" fill="none" stroke="${p.ripple}" stroke-width="0.6" stroke-opacity="${light ? 0.35 : 0.3}"/>
  </pattern>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9 0.6" numOctaves="2" seed="4" result="n"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="${light ? 0.22 : 0.18}"/></feComponentTransfer>
  </filter>
  <filter id="brush" x="-2%" y="-10%" width="104%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="9" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="5"/>
  </filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.4"/></filter>
  <filter id="cloud" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="stamp" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="2" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="2.2"/>
  </filter>
</defs>

<rect width="${W}" height="${H}" fill="${p.mount}"/>
<rect width="${W}" height="${H}" fill="url(#brocade)"/>
<rect x="0" y="${TOP - 4}" width="${W}" height="1" fill="${p.thread}"/>
<rect x="0" y="${BOTTOM + 3}" width="${W}" height="1" fill="${p.thread}"/>

<g clip-path="url(#painting)">
  <rect x="0" y="${TOP}" width="${W}" height="${BOTTOM - TOP}" fill="url(#aged)"/>
  ${moon}
  <g class="pan">
    ${farRange(p, seed + 1, BASE - 40, 110, light ? 0.32 : 0.55)}
    ${farRange(p, seed + 2, BASE - 10, 70, light ? 0.45 : 0.7)}
    ${mist(p, seed)}
    <path d="${areaPath(backHs, BASE, 1, 34)}" fill="url(#pigmentBack)" filter="url(#brush)"/>
    <g filter="url(#brush)">
      <path d="${areaPath(hs, BASE)}" fill="url(#pigment)"/>
      <path d="${areaPath(hs, BASE)}" fill="url(#foot)"/>
      <path d="${cunStrokes(hs, seed)}" fill="none" stroke="${light ? p.ink : p.ridge}" stroke-width="0.8" stroke-opacity="${light ? 0.22 : 0.3}" stroke-linecap="round"/>
      <path d="${ridgeLine(hs, BASE)}" fill="none" stroke="${p.ridge}" stroke-width="1.5" stroke-opacity="${light ? 0.85 : 0.9}" stroke-linejoin="round"/>
    </g>
    ${mossDots(hs, p, seed)}
    <rect x="0" y="${BASE}" width="${CW}" height="${BOTTOM - BASE}" fill="url(#waterWash)"/>
    <g clip-path="url(#waterClip)">${reflection}</g>
    <g class="ripple"><rect x="0" y="${BASE + 4}" width="${CW + 48}" height="${BOTTOM - BASE}" fill="url(#waves)"/></g>
    ${banks(p, seed)}
    ${peak ? peakLabel(peak, p) : ''}
  </g>

  <g class="birds">${birds}</g>
  <g class="boat">
    <path d="M0,${BASE + 30} q22,9 46,0 l-5,6 q-18,5 -36,0 z" fill="${p.ink}" opacity="0.85"/>
    <line x1="24" y1="${BASE + 30}" x2="24" y2="${BASE + 6}" stroke="${p.ink}" stroke-width="1"/>
    <path d="M24,${BASE + 8} l12,18 h-12 z" fill="${light ? '#E9DEC2' : '#3A4756'}" stroke="${p.ink}" stroke-width="0.6"/>
    <circle cx="14" cy="${BASE + 24}" r="2.6" fill="${p.ink}"/>
  </g>

  <rect x="0" y="${TOP}" width="${W}" height="${BOTTOM - TOP}" filter="url(#grain)" opacity="1"/>

  <g>
    ${verticalText(title, 1128, 92, 50, 6, BRUSH, p.inscription)}
    ${verticalText(colophon, 1078, 86, 15, 5, SONG, p.inscription)}
    ${verticalText(verse, 1052, 86, 13, 4, SONG, light ? p.ochre : p.ridge)}
    ${seal(1102, 272, 50, p, sealChars)}
  </g>
  <text x="40" y="${BOTTOM - 16}" font-family="${SONG}" font-size="14" fill="${p.inscription}" opacity="0.8" letter-spacing="0.5">${caption}</text>
</g>
</svg>`;
  return svg;
}
