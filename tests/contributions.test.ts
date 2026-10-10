import { describe, expect, it } from 'vitest';
import { summarize, type Day } from '../scripts/data/contributions';

function days(counts: number[], start = '2025-10-01'): Day[] {
  const base = new Date(`${start}T00:00:00Z`).getTime();
  return counts.map((count, i) => ({
    date: new Date(base + i * 86_400_000).toISOString().slice(0, 10),
    count,
  }));
}

describe('summarize', () => {
  it('treats all-zero calendars as fully janky', () => {
    const t = summarize(days(Array(14).fill(0)));
    expect(t.frames).toBe(0);
    expect(t.jankRate).toBe(1);
    expect(t.longestStreak).toBe(0);
    expect(t.today).toBe(0);
  });

  it('handles calendars with no empty days', () => {
    const t = summarize(days([1, 2, 3, 4, 5, 6, 7, 8]));
    expect(t.frames).toBe(8);
    expect(t.jankRate).toBe(0);
    expect(t.longestStreak).toBe(8);
    expect(t.weekly).toEqual([28, 8]);
    expect(t.today).toBe(8);
  });

  it('finds the longest streak between gaps', () => {
    const t = summarize(days([1, 1, 0, 2, 2, 2, 0, 5]));
    expect(t.longestStreak).toBe(3);
    expect(t.frames).toBe(6);
    expect(t.jankRate).toBeCloseTo(2 / 8);
  });

  it('keeps only the most recent 365 days', () => {
    const counts = [9, 9, ...Array(365).fill(1)];
    const t = summarize(days(counts, '2025-01-01'));
    expect(t.days).toHaveLength(365);
    expect(t.days[0].count).toBe(1);
  });
});
