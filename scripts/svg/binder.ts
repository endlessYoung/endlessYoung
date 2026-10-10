import type { BinderTarget } from '../content';
import type { Theme } from '../theme';
import { MONO, esc, frame } from './primitives';

const W = 380;
const H = 120;

export function render(t: Theme, target: BinderTarget): string {
  const y = 26;
  const h = 34;
  const nodes = [
    { x: 26, w: 96, label: 'Client.Proxy', color: t.muted },
    { x: 146, w: 88, label: '/dev/binder', color: t.accent },
    { x: 258, w: 96, label: target.service, color: t.accent2 },
  ];
  const mid = y + h / 2;

  const boxes = nodes
    .map(
      (n) => `<rect x="${n.x}" y="${y}" width="${n.w}" height="${h}" rx="3" fill="${t.panel}" stroke="${n.color}" stroke-width="1.2"/>
<text x="${n.x + n.w / 2}" y="${mid + 4}" text-anchor="middle" fill="${t.text}" font-size="${n.label.length > 12 ? 9.5 : 10.5}">${esc(n.label)}</text>`,
    )
    .join('');

  const path = `M${nodes[0].x + nodes[0].w} ${mid} H${nodes[2].x}`;

  const body = `
<g font-family="${MONO}">
  <path id="tx" d="${path}" fill="none" stroke="url(#beam)" stroke-width="1.4" class="dash"/>
  ${boxes}
  <g class="hide-reduced" filter="url(#glow)">
    <circle r="3.2" fill="${t.text}"><animateMotion dur="1.6s" repeatCount="indefinite"><mpath xlink:href="#tx"/></animateMotion></circle>
  </g>
  <text x="26" y="88" fill="${t.ok}" font-size="13">transact(${target.id.toUpperCase()})</text>
  <text x="354" y="88" text-anchor="end" fill="${t.muted}" font-size="10" letter-spacing="1.5">TAP TO OPEN ↗</text>
  <line x1="26" y1="98" x2="354" y2="98" stroke="${t.line}"/>
</g>`;

  return frame({ theme: t, width: W, height: H, label: `Open ${target.id}`, body });
}
