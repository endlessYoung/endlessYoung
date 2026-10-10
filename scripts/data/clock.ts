const OFFSET_MS = 8 * 3_600_000;

/** Wall-clock hour and minute in Beijing time (UTC+8, no DST). */
export function beijing(now: Date): { hh: number; mm: number } {
  const local = new Date(now.getTime() + OFFSET_MS);
  return { hh: local.getUTCHours(), mm: local.getUTCMinutes() };
}

/** A short line for the landscape colophon, written vertically, so keep it to Chinese characters. */
export function verse(now: Date): string {
  const { hh } = beijing(now);
  if (hh >= 5 && hh < 11) return '晨光里写代码';
  if (hh >= 11 && hh < 14) return '日中读源码';
  if (hh >= 14 && hh < 19) return '午后发新版';
  if (hh >= 19 && hh < 23) return '灯下读框架';
  return '夜深犹调试';
}

export function greeting(now: Date): string {
  const { hh, mm } = beijing(now);
  if (hh >= 5 && hh < 11) return 'Good morning — compiling the day.';
  if (hh >= 11 && hh < 14) return 'Lunch break — GC in progress.';
  if (hh >= 14 && hh < 19) return 'Afternoon — shipping features.';
  if (hh >= 19 && hh < 23) return 'Evening — reading AOSP.';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hh)}:${pad(mm)} — still debugging WMS.`;
}
