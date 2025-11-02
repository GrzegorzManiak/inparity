import { describe, it, expect } from 'vitest';
import vectors from '../../../testdata/parity.json';
import { bytesToBigInt, bigIntToByteArray, intToBytes, concatBytes, framedBytesFromUint8Array, framedBytesFromBigInt, framedBytesFromString } from '../../src/util/bytes';
import {bigCmp, bigModPos} from "../../src/util/numeric";
import { encUrlSafe, decUrlSafe } from '../../src/util/coding';
import { sha2Hash, sha3Hash, shakeHash, cShakeHash } from '../../src/util/hash';

function hex(buf: Uint8Array): string {
    return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}
function unhex(s: string): Uint8Array {
    if (!s) return new Uint8Array();
    if (s.length % 2 !== 0) throw new Error('odd hex');
    const out = new Uint8Array(s.length / 2);
    for (let i = 0; i < s.length; i += 2) {
        out[i/2] = parseInt(s.slice(i, i+2), 16);
    }
    return out;
}

// Numeric parity

describe('parity: numeric', () => {
    for (const tc of (vectors as any).numeric.mod) {
        it(`mod x=${tc.x} n=${tc.n}`, () => {
            const x = BigInt(tc.x);
            const n = BigInt(tc.n);
            const r = BigInt(tc.r);
            expect(bigModPos(x, n)).toEqual(r);
        });
    }
    for (const tc of (vectors as any).numeric.cmp) {
        it(`cmp a=${tc.a} b=${tc.b}`, () => {
            const a = BigInt(tc.a);
            const b = BigInt(tc.b);
            expect(bigCmp(a, b)).toEqual(tc.c);
        });
    }
});

// Bytes parity

describe('parity: bytes', () => {
    for (const tc of (vectors as any).bytes.bytesToBigInt) {
        it(`bytesToBigInt ${tc.bytes}`, () => {
            const got = bytesToBigInt(unhex(tc.bytes));
            expect(got).toEqual(BigInt(tc.bigint));
        });
    }
    for (const tc of (vectors as any).bytes.bigIntToByteArray) {
        it(`bigIntToByteArray ${tc.bigint}`, () => {
            if ((tc as any).wantErr) {
                expect(() => bigIntToByteArray(BigInt(tc.bigint))).toThrowError();
            } else {
                const got = bigIntToByteArray(BigInt(tc.bigint));
                expect(hex(got)).toEqual(tc.bytes);
            }
        });
    }
    for (const tc of (vectors as any).bytes.intToBytes) {
        it(`intToBytes ${tc.i},${tc.len}`, () => {
            if ((tc as any).wantErr) {
                expect(() => intToBytes(tc.i, tc.len)).toThrowError();
            } else {
                const got = intToBytes(tc.i, tc.len);
                expect(hex(got)).toEqual(tc.bytes);
            }
        });
    }
    for (const tc of (vectors as any).bytes.concat) {
        it(`concat ${tc.a}+${tc.b}`, () => {
            const got = concatBytes(unhex(tc.a), unhex(tc.b));
            expect(hex(got)).toEqual(tc.out);
        });
    }
    for (const tc of (vectors as any).bytes.framedFromBytes) {
        it(`framedFromBytes ${tc.data}`, () => {
            if ((tc as any).wantErr) {
                expect(() => framedBytesFromUint8Array(unhex(tc.data), tc.lenBytes)).toThrowError();
            } else {
                const got = framedBytesFromUint8Array(unhex(tc.data), tc.lenBytes);
                expect(hex(got)).toEqual(tc.frame);
            }
        });
    }
    for (const tc of (vectors as any).bytes.framedFromBigInt) {
        it(`framedFromBigInt ${tc.value}`, () => {
            const got = framedBytesFromBigInt(BigInt(tc.value), tc.lenBytes);
            expect(hex(got)).toEqual(tc.frame);
        });
    }
    for (const tc of (vectors as any).bytes.framedFromString) {
        it(`framedFromString ${tc.str}`, () => {
            if ((tc as any).wantErr) {
                expect(() => framedBytesFromString(tc.str, tc.lenBytes)).toThrowError();
            } else {
                const got = framedBytesFromString(tc.str, tc.lenBytes);
                expect(hex(got)).toEqual(tc.frame);
            }
        });
    }
});

// Coding parity

describe('parity: coding', () => {
    for (const tc of (vectors as any).coding.encode) {
        it(`encode ${tc.bytes}`, () => {
            const got = encUrlSafe(unhex(tc.bytes));
            expect(got).toEqual(tc.b64);
        });
    }
    for (const tc of (vectors as any).coding.decode) {
        it(`decode ${tc.b64}`, () => {
            const got = decUrlSafe(tc.b64);
            expect(hex(got)).toEqual(tc.bytes);
        });
    }
});

// Hash parity

describe('parity: hash', () => {
    for (const tc of (vectors as any).hash.sha2) {
        it(`sha2-${tc.bits} "${tc.msg}"`, async () => {
            const data = new TextEncoder().encode(tc.msg);
            const out = await sha2Hash(data, tc.bits);
            expect(hex(out)).toEqual(tc.hash);
        });
    }
    for (const tc of (vectors as any).hash.sha3) {
        it(`sha3-${tc.bits} "${tc.msg}"`, async () => {
            const data = new TextEncoder().encode(tc.msg);
            const out = await sha3Hash(data, tc.bits);
            expect(hex(out)).toEqual(tc.hash);
        });
    }
    for (const tc of (vectors as any).hash.shake) {
        it(`shake${tc.bits} bits=${tc.outBits} "${tc.msg}"`, async () => {
            const data = new TextEncoder().encode(tc.msg);
            const out = await shakeHash(data, tc.bits, tc.outBits);
            expect(hex(out)).toEqual(tc.hash);
        });
    }
    for (const tc of (vectors as any).hash.cshake) {
        it(`cshake${tc.bits} bits=${tc.outBits} fn="${tc.fn}" cust="${tc.cust}" "${tc.msg}"`, async () => {
            const data = new TextEncoder().encode(tc.msg);
            const out = await cShakeHash(data, tc.bits, tc.outBits, tc.fn, tc.cust);
            expect(hex(out)).toEqual(tc.hash);
        });
    }
});
