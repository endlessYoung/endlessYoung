import { writeFile } from 'node:fs/promises';
import { dumpsys } from './content';
import { layout } from './layout';

function column(theme: 'dark' | 'light'): string {
  return layout
    .map((block) => {
      if (block.kind === 'dumpsys') {
        return `<details><summary><code>$ adb shell dumpsys endlessYoung</code></summary><pre>${dumpsys.replace(/</g, '&lt;')}</pre></details>`;
      }
      const imgs = block.cells
        .map((c) => {
          const img = `<img src="${theme}/${c.file}" style="width:${c.width}" alt="${c.alt.replace(/"/g, '&quot;')}">`;
          return c.link ? `<a href="${c.link}" target="_blank">${img}</a>` : img;
        })
        .join('');
      return `<p>${imgs}</p>`;
    })
    .join('\n');
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>endlessYoung profile preview</title>
<style>
  body { margin: 0; display: grid; grid-template-columns: 1fr 1fr; font-family: system-ui, sans-serif; }
  section { padding: 24px; }
  .dark { background: #0d1117; color: #e6edf3; }
  .light { background: #ffffff; color: #1f2328; }
  h2 { font: 600 14px ui-monospace, monospace; letter-spacing: 2px; }
  p { margin: 0 0 8px; text-align: center; }
  img { max-width: 100%; vertical-align: top; }
  a + a img, a img + a img { margin-left: 0; }
  pre { background: rgba(127,127,127,.12); padding: 12px; }
</style>
<section class="dark"><h2>DARK · prefers-color-scheme: dark</h2>${column('dark')}</section>
<section class="light"><h2>LIGHT · prefers-color-scheme: light</h2>${column('light')}</section>
`;

await writeFile('dist/preview.html', html);
console.log('dist/preview.html written');
