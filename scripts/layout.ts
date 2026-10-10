import { binderTargets, links, projects } from './content';

export interface Cell {
  file: string;
  alt: string;
  width: string;
  link?: string;
}

export type Block = { kind: 'row'; cells: Cell[] } | { kind: 'dumpsys' };

export const OUTPUT_BASE = 'https://raw.githubusercontent.com/endlessYoung/endlessYoung/output/';

export const layout: Block[] = [
  { kind: 'row', cells: [{ file: 'header.svg', alt: 'endlessYoung — boot sequence', width: '100%' }] },
  { kind: 'row', cells: [{ file: 'zygote.svg', alt: 'Zygote: Microsoft engineer, 300+ notes, Android Framework & Compose, AI skills, React/Vue/TS, Agents & RAG', width: '100%' }] },
  { kind: 'row', cells: [{ file: 'services.svg', alt: 'SystemServer: Kotlin, Java, Android, Compose, TypeScript, React, Vue, Python, Docker and more', width: '100%' }] },
  {
    kind: 'row',
    cells: binderTargets.map((b) => ({ file: `binder-${b.id}.svg`, alt: `transact(${b.id.toUpperCase()})`, width: '32%', link: b.link })),
  },
  ...[0, 2, 4].map(
    (i): Block => ({
      kind: 'row',
      cells: projects.slice(i, i + 2).map((p) => ({ file: `task-${p.slug}.svg`, alt: `${p.name} — ${p.desc}`, width: '49%', link: p.link })),
    }),
  ),
  { kind: 'row', cells: [{ file: 'task-more.svg', alt: 'View all repositories', width: '100%', link: links.repos }] },
  { kind: 'row', cells: [{ file: 'perfetto.svg', alt: 'A year of contributions rendered as a Perfetto frame trace', width: '100%' }] },
  { kind: 'row', cells: [{ file: 'agent.svg', alt: 'An agent reasons about who endlessYoung is', width: '100%' }] },
  { kind: 'row', cells: [{ file: 'logcat.svg', alt: 'Latest blog posts as logcat output', width: '100%', link: links.blog }] },
  { kind: 'row', cells: [{ file: 'standby.svg', alt: '加油每一天', width: '100%' }] },
  { kind: 'dumpsys' },
];

export function files(): string[] {
  return layout.flatMap((b) => (b.kind === 'row' ? b.cells.map((c) => c.file) : []));
}
