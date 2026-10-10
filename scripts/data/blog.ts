import { XMLParser, XMLValidator } from 'fast-xml-parser';

export interface Post {
  title: string;
  link: string;
  date: Date;
}

interface RawItem {
  title?: unknown;
  link?: unknown;
  pubDate?: unknown;
}

const parser = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => name === 'item',
});

function text(v: unknown): string {
  if (typeof v === 'string' || typeof v === 'number') return String(v).trim();
  if (v && typeof v === 'object' && '#text' in v) return String((v as { '#text': unknown })['#text']).trim();
  return '';
}

export function parseFeed(xml: string, limit = 6): Post[] {
  const valid = XMLValidator.validate(xml);
  if (valid !== true) throw new Error(`Invalid feed XML: ${valid.err.msg}`);
  const doc = parser.parse(xml) as { rss?: { channel?: { item?: RawItem[] } } };
  const items = doc.rss?.channel?.item ?? [];
  return items
    .map((i) => ({ title: text(i.title), link: text(i.link), date: new Date(text(i.pubDate)) }))
    .filter((p) => p.title && !Number.isNaN(p.date.getTime()))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

export async function fetchPosts(url: string, limit = 6): Promise<Post[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'endlessYoung-profile' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
  const posts = parseFeed(await res.text(), limit);
  if (!posts.length) throw new Error('Feed has no posts');
  return posts;
}
