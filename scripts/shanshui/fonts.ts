import { readFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

export const BRUSH = 'EYBrush';
export const SONG = 'EYSong';

const SOURCES: Record<string, string> = {
  [BRUSH]: 'fonts/MaShanZheng-Regular.ttf',
  [SONG]: 'fonts/ZCOOLXiaoWei-Regular.ttf',
};

const cache = new Map<string, Buffer>();

async function source(family: string): Promise<Buffer> {
  let buf = cache.get(family);
  if (!buf) {
    buf = await readFile(SOURCES[family]);
    cache.set(family, buf);
  }
  return buf;
}

/** Builds @font-face rules embedding only the glyphs each family actually renders. */
export async function fontFaces(usage: Partial<Record<string, string>>): Promise<string> {
  const rules: string[] = [];
  for (const [family, text] of Object.entries(usage)) {
    if (!text) continue;
    const glyphs = Array.from(new Set(Array.from(text))).join('');
    const woff2 = await subsetFont(await source(family), glyphs, { targetFormat: 'woff2' });
    rules.push(`@font-face { font-family: '${family}'; src: url(data:font/woff2;base64,${woff2.toString('base64')}) format('woff2'); }`);
  }
  return rules.join('\n');
}
