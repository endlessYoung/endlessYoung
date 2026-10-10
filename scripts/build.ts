import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { XMLValidator } from 'fast-xml-parser';
import { LOGIN, binderTargets, links, projects } from './content';
import { fetchPosts, type Post } from './data/blog';
import { readCache, withFallback, type Cache } from './data/cache';
import { greeting } from './data/clock';
import { fetchCalendar, summarize, type Trace } from './data/contributions';
import { files } from './layout';
import * as agent from './svg/agent';
import * as binder from './svg/binder';
import * as header from './svg/header';
import * as logcat from './svg/logcat';
import * as perfetto from './svg/perfetto';
import * as services from './svg/services';
import * as standby from './svg/standby';
import * as tasks from './svg/tasks';
import * as zygote from './svg/zygote';
import { themes } from './theme';

const OUT = 'dist';
const PREV_CACHE = join('prev', 'data', 'cache.json');

async function loadTrace(cache: Cache): Promise<Trace | undefined> {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('[contributions] no GH_TOKEN; using cached data');
    return cache.trace;
  }
  return withFallback('contributions', async () => summarize(await fetchCalendar(LOGIN, token)), cache.trace);
}

async function loadPosts(cache: Cache): Promise<Post[] | undefined> {
  const cached = cache.posts?.map((p) => ({ ...p, date: new Date(p.date) }));
  return withFallback('blog', () => fetchPosts(links.feed), cached);
}

async function main() {
  const cache = await readCache(PREV_CACHE);
  const [trace, posts] = await Promise.all([loadTrace(cache), loadPosts(cache)]);
  const now = new Date();

  for (const theme of Object.values(themes)) {
    const dir = join(OUT, theme.name);
    await mkdir(dir, { recursive: true });
    const out: Record<string, string> = {
      'header.svg': header.render(theme, { greeting: greeting(now), today: trace?.today ?? 0 }),
      'zygote.svg': zygote.render(theme),
      'services.svg': services.render(theme),
      'perfetto.svg': perfetto.render(theme, trace),
      'agent.svg': agent.render(theme),
      'logcat.svg': logcat.render(theme, posts, now),
      'standby.svg': standby.render(theme),
      'task-more.svg': tasks.renderMore(theme),
    };
    for (const b of binderTargets) out[`binder-${b.id}.svg`] = binder.render(theme, b);
    projects.forEach((p, i) => (out[`task-${p.slug}.svg`] = tasks.renderCard(theme, p, i)));

    const missing = files().filter((f) => !(f in out));
    if (missing.length) throw new Error(`layout references unrendered files: ${missing.join(', ')}`);

    await Promise.all(Object.entries(out).map(([name, svg]) => writeFile(join(dir, name), svg)));
  }

  const nextCache: Cache = {
    trace,
    posts: posts?.map((p) => ({ title: p.title, link: p.link, date: p.date.toISOString() })),
  };
  await mkdir(join(OUT, 'data'), { recursive: true });
  await writeFile(join(OUT, 'data', 'cache.json'), JSON.stringify(nextCache));

  let count = 0;
  for (const theme of Object.keys(themes)) {
    for (const name of await readdir(join(OUT, theme))) {
      const result = XMLValidator.validate(await readFile(join(OUT, theme, name), 'utf8'));
      if (result !== true) throw new Error(`${theme}/${name} is not valid XML: ${result.err.msg} (line ${result.err.line})`);
      count++;
    }
  }
  console.log(`built ${count} SVGs · trace=${trace ? 'yes' : 'none'} · posts=${posts?.length ?? 0}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
