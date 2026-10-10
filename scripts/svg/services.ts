import { serviceGroups } from '../content';
import type { Theme } from '../theme';
import { MONO, esc, frame } from './primitives';

const W = 1200;
const H = 420;

export function render(t: Theme): string {
  const colW = 226;
  const x0 = 44;
  const rowH = 27;
  let order = 0;

  const columns = serviceGroups
    .map((g, gi) => {
      const x = x0 + gi * colW;
      const header = `<text class="in" style="animation-delay:${(0.3 + gi * 0.5).toFixed(2)}s" x="${x}" y="84" fill="${t.muted}" font-size="10.5" letter-spacing="2">${esc(g.name.toUpperCase())} · ${g.services.length}</text>
<line x1="${x}" y1="92" x2="${x + colW - 22}" y2="92" stroke="${t.line}"/>`;
      const rows = g.services
        .map((s, si) => {
          const y = 118 + si * rowH;
          const at = (0.5 + order++ * 0.11).toFixed(2);
          return `<g class="in" style="animation-delay:${at}s">
  <text class="out" style="animation-delay:${(Number(at) + 0.35).toFixed(2)}s" x="${x}" y="${y}" fill="${t.muted}">[ .. ]</text>
  <text class="in" style="animation-delay:${(Number(at) + 0.35).toFixed(2)}s" x="${x}" y="${y}" fill="${t.ok}">[ OK ]</text>
  <rect x="${x + 54}" y="${y - 9}" width="9" height="9" rx="1.5" fill="${s.color}"/>
  <text x="${x + 70}" y="${y}" fill="${t.text}">${esc(s.name)}</text>
</g>`;
        })
        .join('');
      return header + rows;
    })
    .join('');

  const total = serviceGroups.reduce((n, g) => n + g.services.length, 0);
  const doneAt = (0.5 + total * 0.11 + 0.4).toFixed(2);

  const body = `
<g font-family="${MONO}" font-size="11">
  <text x="${x0}" y="44" fill="${t.muted}" font-size="11" letter-spacing="2">STAGE 03 · SYSTEM SERVER</text>
  <text x="${x0}" y="64" fill="${t.text}" font-size="14"><tspan fill="${t.accent}">SystemServer</tspan>: starting ${total} services ...</text>
  ${columns}
  <line x1="${x0}" y1="326" x2="${W - x0}" y2="326" stroke="${t.line}"/>
  <g class="in" style="animation-delay:${doneAt}s">
    <circle class="pulse" cx="${x0 + 5}" cy="351" r="4" fill="${t.ok}" filter="url(#glow)"/>
    <text x="${x0 + 18}" y="355" fill="${t.text}">${total} services started in 2.84s  <tspan fill="${t.muted}">·</tspan>  <tspan fill="${t.ok}">sys.boot_completed=1</tspan></text>
  </g>
</g>`;

  const css = `
  .out { animation: out .15s linear both; }
  @keyframes out { from { opacity: 1; } to { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .out { display: none; } }
`;

  return frame({ theme: t, width: W, height: H, sheet: 3, title: 'SYSTEM SERVER', label: 'SystemServer starting tech stack services', body, css });
}
