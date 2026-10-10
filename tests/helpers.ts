import { XMLValidator } from 'fast-xml-parser';
import { expect } from 'vitest';

export function expectValidSvg(svg: string, width: number, height: number) {
  const result = XMLValidator.validate(svg);
  expect(result, typeof result === 'object' ? result.err.msg : '').toBe(true);
  expect(svg).toContain(`viewBox="0 0 ${width} ${height}"`);
  expect(svg).toContain('prefers-reduced-motion');
  expect(svg).not.toMatch(/(href|src)="https?:/);
}
