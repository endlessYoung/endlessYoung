import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { Cache } from '../data/cache';
import { verse } from '../data/clock';
import * as header from './header';
import { palettes } from './palette';

const cache = JSON.parse(await readFile('dist/data/cache.json', 'utf8')) as Cache;
const days = cache.trace?.days ?? [];
await mkdir('dist/proto', { recursive: true });

for (const p of Object.values(palettes)) {
  const svg = await header.render(p, { days, verse: verse(new Date()) });
  await writeFile(`dist/proto/header-${p.mode}.svg`, svg);
  console.log(`header-${p.mode}.svg ${(svg.length / 1024).toFixed(0)} KB`);
}

await writeFile(
  'dist/proto/index.html',
  `<!doctype html><meta charset="utf-8"><title>少年游 prototype</title>
<style>body{margin:0;font-family:system-ui}section{padding:28px 40px}.l{background:#fff}.d{background:#0d1117}img{width:100%;max-width:1012px;display:block;margin:auto}</style>
<section class="l"><img src="header-light.svg"></section>
<section class="d"><img src="header-dark.svg"></section>`,
);
