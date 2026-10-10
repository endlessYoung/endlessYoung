import { readFile } from 'node:fs/promises';
import type { Trace } from './contributions';

export interface CachedPost {
  title: string;
  link: string;
  date: string;
}

export interface Cache {
  trace?: Trace;
  posts?: CachedPost[];
}

export async function readCache(path: string): Promise<Cache> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as Cache;
  } catch {
    return {};
  }
}

export async function withFallback<T>(
  name: string,
  fetcher: () => Promise<T>,
  cached: T | undefined,
): Promise<T | undefined> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetcher();
    } catch (err) {
      lastError = err;
    }
  }
  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  console.warn(`[${name}] fetch failed (${reason}); ${cached === undefined ? 'no cache, using placeholder' : 'using cached data'}`);
  return cached;
}
