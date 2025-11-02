import { describe, it, expect } from 'vitest';
import { bigModPos, bigCmp } from '../../src/util/numeric';

describe('numeric utilities', () => {
  it('bigModPos basic and negatives', () => {
    const n = 5n;
    const cases: Array<[bigint, bigint]> = [
      [0n, 0n],
      [1n, 1n],
      [4n, 4n],
      [5n, 0n],
      [6n, 1n],
      [-1n, 4n],
      [-6n, 4n],
      [-10n, 0n],
    ];
    for (const [x, exp] of cases) {
      const got = bigModPos(x, n);
      expect(got).toEqual(exp);
    }
  });

  it('bigModPos large values', () => {
    const x = 1234567890123456789012345678901234567890n;
    const n = 97n;
    const r = x % n;
    const expectVal = r >= 0n ? r : (r + n);
    expect(bigModPos(x, n)).toEqual(expectVal);
  });

  it('bigCmp ordering', () => {
    const cases: Array<[bigint, bigint, number]> = [
      [-2n, -1n, -1],
      [-1n, -1n, 0],
      [-1n, 0n, -1],
      [0n, 0n, 0],
      [1n, 0n, 1],
      [1n, 2n, -1],
      [2n, 1n, 1],
    ];
    for (const [a, b, expectVal] of cases) {
      expect(bigCmp(a, b)).toEqual(expectVal);
    }
  });

  it('bigCmp large numbers', () => {
    const A = 123456789012345678901234567890n;
    const B = 123456789012345678901234567891n;
    expect(bigCmp(A, B)).toEqual(-1);
  });
});
