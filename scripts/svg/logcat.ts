import type { Post } from '../data/blog';
import type { Theme } from '../theme';
import { MONO, SANS, esc, frame, truncate } from './primitives';

const W = 1200;
const H = 280;
const PID = 2048;

function stamp(date: Date, i: number): string {
  const local = new Date(date.getTime() + 8 * 3_600_000);
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(local.getUTCMonth() + 1)}-${p(local.getUTCDate())} ${p(local.getUTCHours())}:${p(local.getUTCMinutes())}:${p(local.getUTCSeconds())}.${p((i * 137 + 42) % 1000, 3)}`;
}

const FRESH_MS = 30 * 86_400_000;

export function render(t: Theme, posts: Post[] | undefined, now = new Date()): string {
  const rowY = (i: number) => 92 + i * 26;

  const rows = posts?.length
    ? posts
        .map((post, i) => {
          const level = i === 0 ? 'W' : 'I';
          const levelColor = i === 0 ? t.accent2 : t.ok;
          const y = rowY(i);
          const title = esc(`《${truncate(post.title, 36)}》`);
          const tag = now.getTime() - post.date.getTime() < FRESH_MS ? 'NEW' : 'LATEST';
          const badgeW = tag.length * 7 + 14;
          const badge =
            i === 0
              ? `<rect x="${W - 52 - badgeW}" y="${y - 12}" width="${badgeW}" height="16" rx="8" fill="${t.accent2}"/><text x="${W - 52 - badgeW / 2}" y="${y}" text-anchor="middle" fill="${t.bg}" font-size="9.5" font-weight="700">${tag}</text>`
              : '';
          return `<g class="in" style="animation-delay:${(0.3 + i * 0.35).toFixed(2)}s">
  ${i === 0 ? `<rect x="36" y="${y - 17}" width="${W - 72}" height="24" fill="${t.accent2}" fill-opacity="0.08"/>` : ''}
  <text x="44" y="${y}" fill="${t.muted}">${stamp(post.date, i)}</text>
  <text x="222" y="${y}" fill="${t.muted}">${PID}  ${PID + i + 1}</text>
  <text x="322" y="${y}" fill="${levelColor}" font-weight="700">${level}</text>
  <text x="344" y="${y}" fill="${t.accent}">Blog:</text>
  <text x="392" y="${y}" fill="${t.text}" font-family="${SANS}" font-size="13">${title}</text>
  ${badge}
</g>`;
        })
        .join('')
    : `<g>
  <text x="44" y="${rowY(0)}" fill="${t.muted}">--:-- --:--:--.---</text>
  <text x="222" y="${rowY(0)}" fill="${t.muted}">${PID}  ${PID + 1}</text>
  <text x="322" y="${rowY(0)}" fill="${t.accent2}" font-weight="700">W</text>
  <text x="344" y="${rowY(0)}" fill="${t.accent}">Blog:</text>
  <text x="392" y="${rowY(0)}" fill="${t.text}">feed unavailable, retrying next hour</text>
</g>`;

  const count = posts?.length ?? 1;
  const promptY = rowY(Math.max(count, 1)) + 6;

  const body = `
<g font-family="${MONO}" font-size="12">
  <text x="44" y="44" fill="${t.muted}" font-size="11" letter-spacing="2">STAGE 08 · LOGCAT</text>
  <text x="44" y="62" fill="${t.text}"><tspan fill="${t.ok}">$ </tspan>adb logcat -s Blog:* <tspan fill="${t.muted}">--format=threadtime</tspan></text>
  <line x1="44" y1="70" x2="${W - 44}" y2="70" stroke="${t.line}"/>
  ${rows}
  <text x="44" y="${promptY}" fill="${t.ok}">$ <tspan class="blink" fill="${t.accent}">▍</tspan></text>
</g>`;

  return frame({ theme: t, width: W, height: H, sheet: 8, title: 'LOGCAT', label: 'Latest blog posts as logcat output', body });
}
