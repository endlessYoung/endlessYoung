import { moreProjects, type Project } from '../content';
import type { Theme } from '../theme';
import { MONO, SANS, esc, frame } from './primitives';

const CARD_W = 580;
const CARD_H = 200;

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function renderCard(t: Theme, p: Project, index: number): string {
  const x = 40;
  const y = 34;
  const w = CARD_W - 80;
  const h = CARD_H - 62;

  const ghosts = [2, 1]
    .map(
      (k) =>
        `<rect x="${x + k * 8}" y="${y - k * 7}" width="${w - k * 16}" height="${h}" rx="10" fill="${t.panel}" stroke="${t.line}" opacity="${0.25 + (2 - k) * 0.25}"/>`,
    )
    .join('');

  const desc = wrap(p.desc, 58)
    .slice(0, 2)
    .map((line, i) => `<text x="${x + 18}" y="${y + 62 + i * 19}" fill="${t.muted}" font-family="${SANS}" font-size="13">${esc(line)}</text>`)
    .join('');

  let tagX = x + 18;
  const tags = p.tags
    .map((tag) => {
      const tw = tag.length * 6.6 + 16;
      const chip = `<rect x="${tagX}" y="${y + h - 32}" width="${tw}" height="18" rx="9" fill="none" stroke="${t.line}"/><text x="${tagX + tw / 2}" y="${y + h - 19}" text-anchor="middle" fill="${t.text}" font-size="10">${esc(tag)}</text>`;
      tagX += tw + 6;
      return chip;
    })
    .join('');

  const initial = esc(p.name.replace(/^[^A-Za-z]*/, '').charAt(0).toUpperCase());
  const taskId = `#${String(index + 1).padStart(2, '0')}`;

  const body = `
<g class="rise" style="animation-delay:${(0.15 * index).toFixed(2)}s" font-family="${MONO}">
  ${ghosts}
  <rect class="edge" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${t.panel}" stroke="url(#beam)" stroke-width="1.4"/>
  <line x1="${x}" y1="${y + 36}" x2="${x + w}" y2="${y + 36}" stroke="${t.line}"/>
  <circle cx="${x + 22}" cy="${y + 18}" r="10" fill="none" stroke="${t.accent}"/>
  <text x="${x + 22}" y="${y + 22}" text-anchor="middle" fill="${t.accent}" font-size="11" font-weight="700">${initial}</text>
  <text x="${x + 40}" y="${y + 23}" fill="${t.text}" font-family="${SANS}" font-size="15" font-weight="600">${esc(p.name)}</text>
  <text x="${x + w - 16}" y="${y + 23}" text-anchor="end" fill="${t.muted}" font-size="10" letter-spacing="1.5">TASK ${taskId}  ⋮</text>
  ${desc}
  ${tags}
  <text x="${x + w - 16}" y="${y + h - 19}" text-anchor="end" fill="${t.accent2}" font-size="10" letter-spacing="1.5">OPEN ↗</text>
</g>`;

  const css = `
  .edge { animation: edge 3.2s ease-in-out infinite; }
  @keyframes edge { 0%,100% { stroke-opacity: .55; } 50% { stroke-opacity: 1; } }
`;

  return frame({ theme: t, width: CARD_W, height: CARD_H, label: `${p.name} — ${p.desc}`, body, css });
}

export function renderMore(t: Theme): string {
  const W = 1200;
  const H = 120;
  const x = 260;
  const w = 600;
  const body = `
<g font-family="${MONO}">
  <text x="44" y="44" fill="${t.muted}" font-size="11" letter-spacing="2">RECENTS</text>
  <text x="44" y="64" fill="${t.text}" font-size="12">${moreProjects.length} more tasks</text>
  <rect class="edge" x="${x}" y="38" width="${w}" height="44" rx="22" fill="${t.panel}" stroke="url(#beam)" stroke-width="1.4"/>
  <text x="${x + w / 2}" y="58" text-anchor="middle" fill="${t.text}" font-size="13" letter-spacing="2">VIEW ALL REPOS  →</text>
  <text x="${x + w / 2}" y="74" text-anchor="middle" fill="${t.muted}" font-size="10">${esc(moreProjects.join('  ·  '))}</text>
</g>`;
  const css = `
  .edge { animation: edge 3.2s ease-in-out infinite; }
  @keyframes edge { 0%,100% { stroke-opacity: .55; } 50% { stroke-opacity: 1; } }
`;
  return frame({ theme: t, width: W, height: H, sheet: 5, title: 'RECENTS', label: 'View all repositories', body, css });
}
