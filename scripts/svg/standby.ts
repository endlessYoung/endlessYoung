import type { Theme } from '../theme';
import { MONO, SANS, frame } from './primitives';

const W = 1200;
const H = 160;

export function render(t: Theme): string {
  const body = `
<rect class="dim" x="12" y="12" width="${W - 24}" height="${H - 24}" fill="${t.bg}"/>
<g text-anchor="middle">
  <text x="${W / 2}" y="78" font-family="${SANS}" font-size="28" font-weight="600" fill="${t.accent}" letter-spacing="6" filter="url(#glow)">加油每一天</text>
  <circle class="breathe" cx="${W / 2}" cy="106" r="4" fill="${t.accent2}" filter="url(#glow)"/>
</g>
<g font-family="${MONO}" font-size="10" fill="${t.muted}" letter-spacing="1.5">
  <text x="40" y="${H - 28}">screen_off_timeout reached</text>
  <text class="in" style="animation-delay:3s" x="40" y="${H - 44}" fill="${t.ok}">● standby</text>
</g>`;

  const css = `
  .dim { animation: dim 3s ease-in .5s both; }
  .breathe { animation: breathe 3.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  @keyframes dim { from { opacity: 0; } to { opacity: .82; } }
  @keyframes breathe { 0%,100% { opacity: .25; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.25); } }
  @media (prefers-reduced-motion: reduce) { .dim { opacity: .82; } }
`;

  return frame({ theme: t, width: W, height: H, sheet: 10, title: 'STANDBY', label: '加油每一天', body, css });
}
