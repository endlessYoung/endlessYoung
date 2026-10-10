import { describe, expect, it } from 'vitest';
import { greeting } from '../scripts/data/clock';

/** Builds a Date for the given Beijing (UTC+8) wall-clock time. */
function bj(hh: number, mm: number): Date {
  return new Date(Date.UTC(2026, 9, 10, hh - 8, mm));
}

describe('greeting', () => {
  const cases: [number, number, string][] = [
    [4, 59, '04:59 — still debugging WMS.'],
    [5, 0, 'Good morning — compiling the day.'],
    [10, 59, 'Good morning — compiling the day.'],
    [11, 0, 'Lunch break — GC in progress.'],
    [13, 59, 'Lunch break — GC in progress.'],
    [14, 0, 'Afternoon — shipping features.'],
    [18, 59, 'Afternoon — shipping features.'],
    [19, 0, 'Evening — reading AOSP.'],
    [22, 59, 'Evening — reading AOSP.'],
    [23, 0, '23:00 — still debugging WMS.'],
    [0, 7, '00:07 — still debugging WMS.'],
  ];

  for (const [hh, mm, expected] of cases) {
    it(`${hh}:${mm} Beijing time`, () => {
      expect(greeting(bj(hh, mm))).toBe(expected);
    });
  }
});
