import { describe, it, expect } from 'vitest';
import { bytesToBigInt, bigIntToByteArray, intToBytes, concatBytes, framedBytesFromUint8Array, framedBytesFromBigInt, framedBytes } from '../../src/util/bytes';

function hex(buf: Uint8Array): string {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

describe('bytes utilities', () => {
  it('BytesToBigInt big-endian', () => {
    const got = bytesToBigInt(new Uint8Array([0x01, 0x02]));
    const want = 0x0102n;
    expect(got).toEqual(want);
  });

  it('bigIntToByteArray', () => {
    // zero
    expect(hex(bigIntToByteArray(0n))).toEqual('00');

    // positive
    expect(hex(bigIntToByteArray(0x0102n))).toEqual('0102');

    // negative should throw
    expect(() => bigIntToByteArray(-1n)).toThrowError();
  });

  it('intToBytes', () => {
    expect(hex(intToBytes(0, 1))).toEqual('00');
    expect(hex(intToBytes(258, 2))).toEqual('0102');
    expect(() => intToBytes(256, 1)).toThrowError();
  });

  it('concatBytes', () => {
    const out = concatBytes(new Uint8Array([0x01]), new Uint8Array([0x02, 0x03]));
    expect(hex(out)).toEqual('010203');
  });

  it('framedBytesFromUint8Array', () => {
    const data = new Uint8Array([0xAA, 0xBB]);
    const fr = framedBytesFromUint8Array(data, 2);
    expect(hex(fr)).toEqual('0002aabb');
  });

  it('framedBytesFromBigInt', () => {
    const frPos = framedBytesFromBigInt(0x0102n, 1);
    expect(hex(frPos)).toEqual('02000102');

    const frNeg = framedBytesFromBigInt(-258n, 1);
    expect(hex(frNeg)).toEqual('02010102');
  });

  it('framedBytes dispatcher', () => {
    const b = framedBytes(new Uint8Array([0xAA]), 1);
    expect(hex(b)).toEqual('01aa');

    const bi = framedBytes(1n, 1);
    expect(hex(bi)).toEqual('010001');

    const s = framedBytes('A', 1);
    expect(hex(s)).toEqual('0141');
  });
});
