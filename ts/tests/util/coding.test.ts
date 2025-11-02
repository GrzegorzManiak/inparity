import { describe, it, expect } from 'vitest';
import { encUrlSafe, decUrlSafe } from '../../src/util/coding';

function hex(u8: Uint8Array) {
  return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
}

describe('coding base64url', () => {
  it('round-trip simple ascii', () => {
    const data = new TextEncoder().encode('hello');
    const enc = encUrlSafe(data);
    expect(enc).toEqual('aGVsbG8');
    const dec = decUrlSafe(enc);
    expect(hex(dec)).toEqual(hex(data));
  });

  it('handles padding removal and restoration', () => {
    const bytes = new Uint8Array([0x01, 0x02]);
    const enc = encUrlSafe(bytes);
    // standard base64 would be AQI= ; url-safe removes padding
    expect(enc).toEqual('AQI');
    const dec = decUrlSafe(enc);
    expect(hex(dec)).toEqual('0102');
  });

  it('non-ascii bytes and url replacements', () => {
    const bytes = new Uint8Array([0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88, 0x77, 0x66, 0x55, 0x44]);
    const enc = encUrlSafe(bytes);
    expect(enc).toEqual('_-7dzLuqmYh3ZlVE');
    const dec = decUrlSafe(enc);
    expect(hex(dec)).toEqual('ffeeddccbbaa998877665544');
  });
});
