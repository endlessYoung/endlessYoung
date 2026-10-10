import type { Theme } from '../theme';
import { MONO, SANS, delay, esc, frame } from './primitives';

export interface HeaderData {
  greeting: string;
  today: number;
}

const BOOT = [
  'endlessYoung bootloader v26.10',
  'fastboot: unlocked  ·  secure boot: verified',
  'loading kernel @ 0x80080000 ...',
];

const KERNEL = [
  '[    0.000000] Booting Linux on physical CPU 0x0',
  '[    0.000000] Linux version 6.6.30-endlessYoung (clang 19)',
  '[    0.412093] binder: /dev/binder registered',
  '[    0.873551] init: mounting /data ... curiosity.img',
  '[    1.284117] init: starting service \'zygote\'...',
  '[    1.692840] SystemServer: starting ActivityManagerService',
  '[    2.031552] binder: 1024:1024 transaction to endlessYoung',
  '[    2.480001] init: sys.boot_completed=1',
];

const W = 1200;
const H = 360;

export function render(t: Theme, d: HeaderData): string {
  const lineH = 17;
  const bootLines = BOOT.map(
    (line, i) =>
      `<text class="in" ${delay(0.2 + i * 0.4)} x="44" y="${52 + i * lineH}" fill="${i === 0 ? t.accent : t.muted}">${esc(line)}</text>`,
  ).join('');

  const kernelTop = 52 + BOOT.length * lineH + 10;
  const kernelLines = KERNEL.map((line, i) => {
    const [stamp, ...rest] = line.split('] ');
    return `<text class="in" ${delay(1.5 + i * 0.3)} x="44" y="${kernelTop + i * lineH}"><tspan fill="${t.ok}">${esc(stamp)}]</tspan><tspan fill="${t.muted}"> ${esc(rest.join('] '))}</tspan></text>`;
  }).join('');

  const barX = 44;
  const barW = W - 88;
  const barY = H - 46;

  const info = [
    ['OWNER', 'foreverYoung', t.text],
    ['ORG', 'Microsoft', t.text],
    ['SHEET', '01 / PROFILE', t.accent],
    ['UPTIME', `commits today: ${d.today}`, t.ok],
  ]
    .map(
      ([k, v, color], i) =>
        `<text x="${W - 228}" y="${66 + i * 22}" fill="${t.muted}">${k}</text><text x="${W - 160}" y="${66 + i * 22}" fill="${color}">${esc(v)}</text>`,
    )
    .join('');

  const body = `
<g class="logs" font-family="${MONO}" font-size="11.5">${bootLines}${kernelLines}</g>
<g class="info in" ${delay(0.4)} font-family="${MONO}" font-size="11">
  <rect x="${W - 244}" y="40" width="208" height="104" rx="2" fill="${t.panel}" stroke="url(#beam)" stroke-width="1"/>
  ${info}
</g>
<g class="ignite">
  <text x="${W / 2 + 3}" y="196" text-anchor="middle" font-family="${SANS}" font-size="68" font-weight="700" fill="${t.accent}" opacity="0.3" filter="url(#glow)">endlessYoung</text>
  <text x="${W / 2}" y="193" text-anchor="middle" font-family="${SANS}" font-size="68" font-weight="700" fill="url(#title)">endlessYoung</text>
</g>
<g class="tagline" text-anchor="middle">
  <text x="${W / 2}" y="232" font-family="${MONO}" font-size="15" fill="${t.muted}" letter-spacing="1">Android Framework  ·  Compose  ·  Agents</text>
  <text x="${W / 2}" y="266" font-family="${MONO}" font-size="14" fill="${t.accent2}"><tspan fill="${t.ok}">$ </tspan>${esc(d.greeting)}<tspan class="blink" fill="${t.accent}"> ▍</tspan></text>
</g>
<g font-family="${MONO}" font-size="10" fill="${t.muted}" letter-spacing="2">
  <rect x="${barX}" y="${barY}" width="${barW}" height="4" fill="${t.line}"/>
  <rect class="grow" x="${barX}" y="${barY}" width="${barW}" height="4" fill="url(#beam)" style="animation-duration:4s;animation-delay:.3s"/>
  <text x="${barX}" y="${barY - 8}">BOOT</text>
  <text class="in" ${delay(4.3)} x="${barX + barW}" y="${barY - 8}" text-anchor="end" fill="${t.ok}">READY · 100%</text>
</g>`;

  const css = `
  .logs { animation: recede .9s ease-in 4s forwards; }
  .ignite { animation: ignite 1.2s ease-out 4.1s both; transform-box: fill-box; transform-origin: center; }
  .tagline { animation: in .8s ease-out 4.8s both; }
  @keyframes recede { to { opacity: .16; transform: translateY(-12px); } }
  @keyframes ignite { from { opacity: 0; transform: scale(.94); } 60% { opacity: 1; } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .logs { opacity: .16; } }
`;

  const defs = `<linearGradient id="title" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#FFFFFF"/><stop offset="65%" stop-color="${t.name === 'dark' ? '#EDE9FE' : '#FFFFFF'}"/><stop offset="100%" stop-color="${t.name === 'dark' ? t.accent : t.accent2}"/>
  </linearGradient>`;

  return frame({ theme: t, width: W, height: H, sheet: 1, title: 'BOOT SEQUENCE', label: 'endlessYoung — boot sequence', body, css, defs, scan: true });
}
