import { describe, expect, it } from 'vitest';
import { esc, frame } from '../scripts/svg/primitives';
import { themes } from '../scripts/theme';
import { expectValidSvg } from './helpers';

describe('esc', () => {
  it('escapes XML special characters', () => {
    expect(esc(`<a&"b'>`)).toBe('&lt;a&amp;&quot;b&#39;&gt;');
  });
});

describe('frame', () => {
  for (const theme of Object.values(themes)) {
    it(`produces a valid svg for ${theme.name}`, () => {
      const svg = frame({ theme, width: 600, height: 200, sheet: 3, title: 'TEST', body: '<g/>' });
      expectValidSvg(svg, 600, 200);
    });
  }

  it('adds the blueprint title block only in light theme', () => {
    const args = { width: 600, height: 200, sheet: 3, title: 'TEST', body: '' };
    expect(frame({ ...args, theme: themes.light })).toContain('DRAWN BY endlessYoung');
    expect(frame({ ...args, theme: themes.dark })).not.toContain('DRAWN BY endlessYoung');
  });
});
