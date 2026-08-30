import { expect, test } from 'bun:test';
import { normalizeUnixTimestamp } from './normalizeUnixTimestamp';

test('normalizeUnixTimestamp keeps second-based Unix timestamps unchanged', () => {
  expect(normalizeUnixTimestamp(1718718481)).toBe(1718718481);
  expect(normalizeUnixTimestamp(0)).toBe(0);
  expect(normalizeUnixTimestamp(-1718718481)).toBe(-1718718481);
});

test('normalizeUnixTimestamp converts millisecond timestamps to seconds', () => {
  expect(normalizeUnixTimestamp(1718718481000)).toBe(1718718481);
  expect(normalizeUnixTimestamp(1718718481000 + 500)).toBe(1718718481);
  expect(normalizeUnixTimestamp(-1718718481000)).toBe(-1718718481);
});

test('normalizeUnixTimestamp guards invalid values', () => {
  expect(normalizeUnixTimestamp(Number.NaN)).toBe(0);
  expect(normalizeUnixTimestamp(Number.POSITIVE_INFINITY)).toBe(0);
  expect(normalizeUnixTimestamp(Number.NEGATIVE_INFINITY)).toBe(0);
});
