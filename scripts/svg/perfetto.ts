import type { Trace } from '../data/contributions';
import type { Theme } from '../theme';
import { MONO, frame } from './primitives';

const W = 1200;
const H = 300;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const LANE_X = 168;
const LANE_W = W - LANE_X - 28;
const FRAMES_TOP = 74;
const FRAMES_BOTTOM = 186;
const CPU_TOP = 202;
const CPU_BOTTOM = 238;

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, k: number): string {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, '0');
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
}

function ramp(t: Theme, k: number): string {
  const [a, b, c] = t.beam;
  return k < 0.5 ? mix(a, b, k * 2) : mix(b, c, (k - 0.5) * 2);
}

function lanes(t: Theme): string {
  const lane = (y: number, h: number, title: string, sub: string) => `
  <rect x="24" y="${y}" width="${LANE_X - 32}" height="${h}" fill="${t.panel}" stroke="${t.line}"/>
  <text x="34" y="${y + 18}" fill="${t.text}" font-size="11">${title}</text>
  <text x="34" y="${y + 33}" fill="${t.muted}" font-size="9.5">${sub}</text>
  <rect x="${LANE_X}" y="${y}" width="${LANE_W}" height="${h}" fill="${t.panel}" fill-opacity="0.55" stroke="${t.line}"/>`;
  return (
    lane(FRAMES_TOP, FRAMES_BOTTOM - FRAMES_TOP, 'main · 1024', 'Choreographer#doFrame') +
    lane(CPU_TOP, CPU_BOTTOM - CPU_TOP, 'cpu · weekly', 'commits / week')
  );
}

function toolbar(t: Theme, metrics: string): string {
  return `
  <rect x="24" y="26" width="${W - 48}" height="32" fill="${t.panel}" stroke="${t.line}"/>
  <circle cx="44" cy="42" r="5" fill="${t.accent}"/>
  <text x="58" y="46" fill="${t.text}" font-size="12">Perfetto</text>
  <text x="130" y="46" fill="${t.muted}" font-size="11">Choreographer#doFrame  ·  endlessYoung  ·  last 365 days</text>
  ${metrics}`;
}

export function render(t: Theme, trace: Trace | undefined): string {
  if (!trace || trace.days.length === 0) {
    const body = `
<g font-family="${MONO}">
  ${toolbar(t, '')}
  ${lanes(t)}
  <text x="${LANE_X + LANE_W / 2}" y="${(FRAMES_TOP + FRAMES_BOTTOM) / 2 + 6}" text-anchor="middle" fill="${t.muted}" font-size="16" letter-spacing="4">NO TRACE DATA</text>
</g>`;
    return frame({ theme: t, width: W, height: H, sheet: 6, title: 'PERFETTO TRACE', label: 'Contribution trace unavailable', body });
  }

  const { days, weekly } = trace;
  const step = LANE_W / days.length;
  const barW = Math.max(1, step - 0.35);
  const maxLog = Math.log2(Math.max(...days.map((d) => d.count)) + 1) || 1;
  const laneH = FRAMES_BOTTOM - FRAMES_TOP - 8;

  const bars = days
    .map((d, i) => {
      const x = (LANE_X + i * step + (step - barW) / 2).toFixed(2);
      if (d.count === 0) {
        return `<rect x="${x}" y="${FRAMES_BOTTOM - 7}" width="${barW.toFixed(2)}" height="7" fill="${t.jank}" fill-opacity="0.75"/>`;
      }
      const k = Math.log2(d.count + 1) / maxLog;
      const h = Math.max(12, k * laneH);
      return `<rect x="${x}" y="${(FRAMES_BOTTOM - h).toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" fill="${ramp(t, k)}"/>`;
    })
    .join('');

  const maxWeek = Math.max(1, ...weekly);
  const wStep = LANE_W / Math.max(1, weekly.length - 1);
  const cpuH = CPU_BOTTOM - CPU_TOP - 6;
  const pts = weekly.map((v, i) => `${(LANE_X + i * wStep).toFixed(1)},${(CPU_BOTTOM - 2 - (v / maxWeek) * cpuH).toFixed(1)}`);
  const cpuLine = `M${pts.join(' L')}`;
  const cpuArea = `${cpuLine} L${LANE_X + LANE_W},${CPU_BOTTOM} L${LANE_X},${CPU_BOTTOM} Z`;

  const months = days
    .map((d, i) => (d.date.endsWith('-01') ? { i, m: MONTHS[Number(d.date.slice(5, 7)) - 1] } : null))
    .filter((x): x is { i: number; m: string } => x !== null)
    .map(
      ({ i, m }) =>
        `<line x1="${(LANE_X + i * step).toFixed(1)}" y1="${FRAMES_TOP}" x2="${(LANE_X + i * step).toFixed(1)}" y2="${CPU_BOTTOM}" stroke="${t.line}" stroke-opacity="0.45" stroke-dasharray="2 4"/><text x="${(LANE_X + i * step + 3).toFixed(1)}" y="251" fill="${t.muted}" font-size="9">${m}</text>`,
    )
    .join('');

  const jank = (trace.jankRate * 100).toFixed(1);
  const metricText = `<text x="${W - 40}" y="46" text-anchor="end" font-size="11"><tspan fill="${t.text}">Frames: ${trace.frames}</tspan><tspan fill="${t.muted}">   ·   </tspan><tspan fill="${t.jank}">Jank: ${jank}%</tspan><tspan fill="${t.muted}">   ·   </tspan><tspan fill="${t.ok}">Longest streak: ${trace.longestStreak}d</tspan></text>`;
  const body = `
<g font-family="${MONO}">
  ${toolbar(t, metricText)}
  ${lanes(t)}
  ${months}
  <line x1="${LANE_X}" y1="${FRAMES_BOTTOM - laneH * 0.5}" x2="${LANE_X + LANE_W}" y2="${FRAMES_BOTTOM - laneH * 0.5}" stroke="${t.ok}" stroke-opacity="0.5" stroke-dasharray="6 4"/>
  <text x="${LANE_X + LANE_W - 4}" y="${FRAMES_BOTTOM - laneH * 0.5 - 4}" text-anchor="end" fill="${t.ok}" font-size="9">16.6 ms</text>
  <g class="bars">${bars}</g>
  <path d="${cpuArea}" fill="url(#beam)" fill-opacity="0.18"/>
  <path d="${cpuLine}" fill="none" stroke="url(#beam)" stroke-width="1.4"/>
  <g class="playhead hide-reduced">
    <line x1="${LANE_X}" y1="${FRAMES_TOP - 6}" x2="${LANE_X}" y2="${CPU_BOTTOM + 4}" stroke="${t.accent2}" stroke-width="1.2"/>
    <path d="M${LANE_X - 5} ${FRAMES_TOP - 10} h10 l-5 6 z" fill="${t.accent2}"/>
  </g>
  <g font-size="9" fill="${t.muted}">
    <rect x="${LANE_X}" y="262" width="8" height="8" fill="${t.jank}"/><text x="${LANE_X + 14}" y="270">jank (no commits)</text>
    <rect x="${LANE_X + 130}" y="262" width="8" height="8" fill="${ramp(t, 0.2)}"/><rect x="${LANE_X + 140}" y="262" width="8" height="8" fill="${ramp(t, 0.6)}"/><rect x="${LANE_X + 150}" y="262" width="8" height="8" fill="${ramp(t, 1)}"/><text x="${LANE_X + 164}" y="270">frame cost (log commits)</text>
  </g>
</g>`;

  const css = `
  .bars { animation: in 1.2s ease-out both; }
  .playhead { animation: play 8s linear infinite; }
  @keyframes play { from { transform: translateX(0); } to { transform: translateX(${LANE_W}px); } }
`;

  return frame({
    theme: t,
    width: W,
    height: H,
    sheet: 6,
    title: 'PERFETTO TRACE',
    label: `Contribution trace: ${trace.frames} active days, jank ${jank}%, longest streak ${trace.longestStreak} days`,
    body,
    css,
  });
}
