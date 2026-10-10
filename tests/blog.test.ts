import { describe, expect, it } from 'vitest';
import { parseFeed } from '../scripts/data/blog';

const item = (title: string, date: string) =>
  `<item><title><![CDATA[${title}]]></title><link>https://example.com/${encodeURIComponent(title)}</link><pubDate>${date}</pubDate></item>`;

const feed = (items: string) =>
  `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>Blog</title>${items}</channel></rss>`;

describe('parseFeed', () => {
  it('sorts posts newest first and applies the limit', () => {
    const xml = feed(
      [
        item('Old', 'Mon, 01 Sep 2026 00:00:00 GMT'),
        item('Newest', 'Fri, 09 Oct 2026 00:00:00 GMT'),
        item('Middle', 'Thu, 01 Oct 2026 00:00:00 GMT'),
      ].join(''),
    );
    const posts = parseFeed(xml, 2);
    expect(posts.map((p) => p.title)).toEqual(['Newest', 'Middle']);
    expect(posts[0].link).toBe('https://example.com/Newest');
    expect(posts[0].date.toISOString()).toBe('2026-10-09T00:00:00.000Z');
  });

  it('handles a single item feed', () => {
    const posts = parseFeed(feed(item('Only <one> & more', 'Fri, 09 Oct 2026 00:00:00 GMT')));
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Only <one> & more');
  });

  it('skips items without a valid date', () => {
    const posts = parseFeed(feed(item('A', 'not a date') + item('B', 'Fri, 09 Oct 2026 00:00:00 GMT')));
    expect(posts.map((p) => p.title)).toEqual(['B']);
  });

  it('throws on malformed xml', () => {
    expect(() => parseFeed('<rss><channel>')).toThrow();
  });
});
