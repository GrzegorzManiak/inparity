import { sha256, sha384, sha512 } from '@noble/hashes/sha2.js';
import {
    sha3_224 as nobleSha3_224,
    sha3_256 as nobleSha3_256,
    sha3_384 as nobleSha3_384,
    sha3_512 as nobleSha3_512,
    shake128 as nobleShake128,
    shake256 as nobleShake256,
} from '@noble/hashes/sha3.js';
import { cshake128 as nobleCshake128, cshake256 as nobleCshake256 } from '@noble/hashes/sha3-addons.js';

// Keep public types
type Sha2 = 256 | 384 | 512;

/**
 * Computes the SHA-2 hash of the given data.
 *
 * @param data - The input data to hash.
 * @param bits - The SHA-2 bit length (256, 384, or 512).
 *
 * @returns A promise that resolves to the hash as a Uint8Array.
 */
async function sha2Hash(data: Uint8Array, bits: Sha2): Promise<Uint8Array> {
    switch (bits) {
        case 256:
            return sha256(data);
        case 384:
            return sha384(data);
        case 512:
            return sha512(data);
        default:
            throw new Error(`Unsupported SHA-2 bit length: ${bits}`);
    }
}

// SHA3 FIPS variants
type Sha3 = 224 | 256 | 384 | 512;

/**
 * Computes the SHA-3 hash of the given data.
 *
 * @param data - The input data to hash.
 * @param bits - The SHA-3 bit length (224, 256, 384, or 512).
 *
 * @returns A promise that resolves to the hash as a Uint8Array.
 */
async function sha3Hash(data: Uint8Array, bits: Sha3): Promise<Uint8Array> {
    switch (bits) {
        case 224:
            return nobleSha3_224(data);
        case 256:
            return nobleSha3_256(data);
        case 384:
            return nobleSha3_384(data);
        case 512:
            return nobleSha3_512(data);
        default:
            throw new Error(`Unsupported SHA-3 bit length: ${bits}`);
    }
}

// XOFs
type Shake = 128 | 256;

/**
 * Computes the SHAKE hash of the given data.
 *
 * @param data - The input data to hash.
 * @param bits - The SHAKE bit length (128 or 256).
 * @param outputLengthInBits - The desired output length in bits.
 *
 * @returns A promise that resolves to the hash as a Uint8Array.
 */
async function shakeHash(data: Uint8Array, bits: Shake, outputLengthInBits: number): Promise<Uint8Array> {
    if (outputLengthInBits % 8 !== 0) throw new Error('outputLengthInBits must be a multiple of 8');
    const dkLen = outputLengthInBits >>> 3; // bytes
    switch (bits) {
        case 128:
            return nobleShake128(data, { dkLen });
        case 256:
            return nobleShake256(data, { dkLen });
        default:
            throw new Error(`Unsupported SHAKE bit length: ${bits}`);
    }
}

// cSHAKE
type CShake = 128 | 256;

/**
 * Computes the cSHAKE hash of the given data.
 *
 * @param data - The input data to hash.
 * @param bits - The cSHAKE bit length (128 or 256).
 * @param outputLengthInBits - The desired output length in bits.
 * @param functionName - The function-name string (N in SP 800-185).
 * @param customization - The customization string (S in SP 800-185).
 *
 * @returns A promise that resolves to the hash as a Uint8Array.
 */
async function cShakeHash(
    data: Uint8Array,
    bits: CShake,
    outputLengthInBits: number,
    functionName: string,
    customization: string
): Promise<Uint8Array> {
    if (outputLengthInBits % 8 !== 0) throw new Error('outputLengthInBits must be a multiple of 8');
    const dkLen = outputLengthInBits >>> 3; // bytes

    if (functionName === '' && customization === '') {
        return shakeHash(data, bits, outputLengthInBits);
    }

    const opts: any = { dkLen, personalization: customization };
    if (functionName) opts.name = functionName;

    switch (bits) {
        case 128:
            return nobleCshake128(data, opts);
        case 256:
            return nobleCshake256(data, opts);
        default:
            throw new Error(`Unsupported cSHAKE bit length: ${bits}`);
    }
}

export {
    type Sha2,
    type Sha3,
    type Shake,
    type CShake,
    sha2Hash,
    sha3Hash,
    shakeHash,
    cShakeHash,
};
