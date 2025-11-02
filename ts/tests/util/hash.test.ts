import { describe, it, expect } from 'vitest';
import { sha2Hash, sha3Hash, shakeHash, cShakeHash, type Sha2, type Sha3, type Shake, type CShake } from '../../src/util/hash';

function hex(buf: Uint8Array): string {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

// SHA-2 vectors
const vectorsSha2: Record<Sha2, { msg: string; hash: string }[]> = {
  256: [
    { msg: '', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { msg: 'abc', hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
  ],
  384: [
    { msg: '', hash: '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b' },
    { msg: 'abc', hash: 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7' },
  ],
  512: [
    { msg: '', hash: 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e' },
    { msg: 'abc', hash: 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f' },
  ],
};

describe('sha2Hash', () => {
  for (const bits of [256, 384, 512] as Sha2[]) {
    describe(`SHA-${bits}`, () => {
      for (const v of vectorsSha2[bits]) {
        it(`hash("${v.msg}")`, async () => {
          const data = new TextEncoder().encode(v.msg);
          const out = await sha2Hash(data, bits);
          expect(hex(out)).toEqual(v.hash);
        });
      }
    });
  }
});

// SHA-3 vectors (from js-sha3 README)
const vectorsSha3: Record<Sha3, { msg: string; hash: string }[]> = {
  224: [
    { msg: '', hash: '6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7' },
    { msg: 'The quick brown fox jumps over the lazy dog', hash: 'd15dadceaa4d5d7bb3b48f446421d542e08ad8887305e28d58335795' },
  ],
  256: [
    { msg: '', hash: 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a' },
    { msg: 'The quick brown fox jumps over the lazy dog', hash: '69070dda01975c8c120c3aada1b282394e7f032fa9cf32f4cb2259a0897dfc04' },
  ],
  384: [
    { msg: '', hash: '0c63a75b845e4f7d01107d852e4c2485c51a50aaaa94fc61995e71bbee983a2ac3713831264adb47fb6bd1e058d5f004' },
    { msg: 'The quick brown fox jumps over the lazy dog', hash: '7063465e08a93bce31cd89d2e3ca8f602498696e253592ed26f07bf7e703cf328581e1471a7ba7ab119b1a9ebdf8be41' },
  ],
  512: [
    { msg: '', hash: 'a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26' },
    { msg: 'The quick brown fox jumps over the lazy dog', hash: '01dedd5de4ef14642445ba5f5b97c15e47b9ad931326e4b0727cd94cefc44fff23f07bf543139939b49128caf436dc1bdee54fcb24023a08d9403f9b4bf0d450' },
  ],
};

describe('sha3Hash', () => {
  for (const bits of [224, 256, 384, 512] as Sha3[]) {
    describe(`SHA3-${bits}`, () => {
      for (const v of vectorsSha3[bits]) {
        it(`hash("${v.msg}")`, async () => {
          const data = new TextEncoder().encode(v.msg);
          const out = await sha3Hash(data, bits);
          expect(hex(out)).toEqual(v.hash);
        });
      }
    });
  }
});

// SHAKE vectors
const vectorsShake: Record<Shake, { msg: string; bits: number; hash: string }[]> = {
  128: [
    { msg: '', bits: 256, hash: '7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26' },
  ],
  256: [
    { msg: '', bits: 512, hash: '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762fd75dc4ddd8c0f200cb05019d67b592f6fc821c49479ab48640292eacb3b7c4be' },
  ],
};

describe('shakeHash', () => {
  for (const bits of [128, 256] as Shake[]) {
    describe(`SHAKE${bits}`, () => {
      for (const v of vectorsShake[bits]) {
        it(`hash("${v.msg}", ${v.bits})`, async () => {
          const data = new TextEncoder().encode(v.msg);
          const out = await shakeHash(data, bits, v.bits);
          expect(hex(out)).toEqual(v.hash);
        });
      }
    });
  }
});

// cSHAKE vectors (equivalence to SHAKE when customization and function-name are empty)
const vectorsCShake: Record<CShake, { msg: string; bits: number; fn: string; cust: string; hash: string }[]> = {
  128: [
    { msg: '', bits: 256, fn: '', cust: '', hash: '7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26' },
  ],
  256: [
    { msg: '', bits: 512, fn: '', cust: '', hash: '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762fd75dc4ddd8c0f200cb05019d67b592f6fc821c49479ab48640292eacb3b7c4be' },
  ],
};

describe('cshakeHash', () => {
  for (const bits of [128, 256] as CShake[]) {
    describe(`cSHAKE${bits}`, () => {
      for (const v of vectorsCShake[bits]) {
        it(`hash("${v.msg}", ${v.bits}, fn="${v.fn}", cust="${v.cust}")`, async () => {
          const data = new TextEncoder().encode(v.msg);
          const out = await cShakeHash(data, bits, v.bits, v.fn, v.cust);
          expect(hex(out)).toEqual(v.hash);
        });
      }
    });
  }
});
