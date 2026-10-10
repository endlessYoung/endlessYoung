import { zygoteProcs } from '../content';
import type { Theme } from '../theme';
import { MONO, delay, dimension, esc, frame } from './primitives';

const W = 1200;
const H = 300;

export function render(t: Theme): string {
  const root = { x: 48, y: 112, w: 200, h: 76 };
  const originX = root.x + root.w;
  const originY = root.y + root.h / 2;
  const boxX = 420;
  const boxW = 440;
  const boxH = 30;
  const rowY = (i: number) => 34 + i * 38;

  const wires = zygoteProcs
    .map((_, i) => {
      const y = rowY(i) + boxH / 2;
      const d = `M${originX} ${originY} C ${originX + 90} ${originY}, ${boxX - 90} ${y}, ${boxX} ${y}`;
      return `<path id="fork${i}" class="dash" d="${d}"/>`;
    })
    .join('');

  const dots = zygoteProcs
    .map(
      (_, i) =>
        `<circle r="3" fill="${i % 2 ? t.accent2 : t.text}"><animateMotion dur="${(2 + i * 0.2).toFixed(1)}s" begin="${(0.6 + i * 0.3).toFixed(1)}s" repeatCount="indefinite"><mpath xlink:href="#fork${i}"/></animateMotion></circle>`,
    )
    .join('');

  const boxes = zygoteProcs
    .map((p, i) => {
      const y = rowY(i);
      const stateColor = p.state === 'FOCUSED' ? t.accent2 : p.state === 'RUNNING' ? t.ok : t.accent;
      return `<g class="rise" ${delay(0.5 + i * 0.3)}>
  <rect x="${boxX}" y="${y}" width="${boxW}" height="${boxH}" rx="3" fill="${t.panel}" stroke="${t.line}"/>
  <rect x="${boxX}" y="${y}" width="4" height="${boxH}" rx="2" fill="${stateColor}"/>
  <text x="${boxX + 16}" y="${y + 20}" fill="${t.muted}">${p.pid}</text>
  <text x="${boxX + 70}" y="${y + 20}" fill="${t.text}">${esc(p.name)}</text>
  <rect x="${boxX + boxW - 92}" y="${y + 7}" width="80" height="16" rx="8" fill="none" stroke="${stateColor}"/>
  <text x="${boxX + boxW - 52}" y="${y + 19}" text-anchor="middle" font-size="10" fill="${stateColor}">${esc(p.state)}</text>
</g>`;
    })
    .join('');

  const stats = [
    ['abi', 'arm64-v8a'],
    ['preload.classes', '6,104'],
    ['preload.resources', '2,341'],
    ['children', String(zygoteProcs.length)],
    ['policy', 'fork() then specialize'],
  ]
    .map(
      ([k, v], i) =>
        `<text x="912" y="${62 + i * 22}" fill="${t.muted}">${k}</text><text x="1172" y="${62 + i * 22}" text-anchor="end" fill="${t.text}">${esc(v)}</text>`,
    )
    .join('');

  const body = `
<g font-family="${MONO}" font-size="12">
  <text x="${root.x}" y="44" fill="${t.muted}" font-size="11" letter-spacing="2">STAGE 02 · ZYGOTE</text>
  <text x="${root.x}" y="66" fill="${t.text}" font-size="15">fork() × ${zygoteProcs.length}</text>
  <g fill="none" stroke="url(#beam)" stroke-width="1.4" opacity="0.9">${wires}</g>
  <g class="hide-reduced" filter="url(#glow)">${dots}</g>
  <g class="pulse">
    <rect x="${root.x}" y="${root.y}" width="${root.w}" height="${root.h}" rx="4" fill="${t.panel}" stroke="${t.accent}" stroke-width="1.5"/>
  </g>
  <rect x="${root.x}" y="${root.y}" width="5" height="${root.h}" rx="2" fill="${t.accent}"/>
  <text x="${root.x + 20}" y="${root.y + 30}" fill="${t.text}" font-size="16">zygote64</text>
  <text x="${root.x + 20}" y="${root.y + 54}" fill="${t.muted}" font-size="11">pid 1 · app_process64</text>
  ${boxes}
  <g class="in" ${delay(2.4)}>
    <text x="912" y="40" fill="${t.muted}" font-size="11" letter-spacing="2">PROCESS INFO</text>
    <line x1="912" y1="48" x2="1172" y2="48" stroke="${t.line}"/>
    ${stats}
  </g>
  ${dimension(t, boxX, boxX + boxW, 270, '440 px · 6 children')}
</g>`;

  return frame({ theme: t, width: W, height: H, sheet: 2, title: 'ZYGOTE', label: 'Zygote forks six highlight processes', body });
}
