import {
    sha3_512,
    sha3_384,
    sha3_256,
    sha3_224,
    shake128,
    shake256,
    cshake128,
    cshake256,
} from 'js-sha3';

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
    const algo = `SHA-${bits}`;

    // Browser path
    if (typeof crypto !== "undefined" && crypto.subtle?.digest) {
        const hashBuffer = await crypto.subtle.digest(algo, data);
        return new Uint8Array(hashBuffer);
    }

    // Node.js path
    // @ts-ignore
    if (typeof process !== "undefined" && typeof require !== "undefined") {
        // @ts-ignore
        const { createHash } = require("crypto");
        const hash = createHash(`sha${bits}`);
        hash.update(data);
        return Uint8Array.from(hash.digest());
    }

    throw new Error("No SHA-2 implementation available in this environment.");
}

type Sha3 = 224 | 256 | 384 | 512;

function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) throw new Error('hex length must be even');
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return out;
}

/**
 * Computes the SHA-3 hash of the given data.
 *
 * @param data - The input data to hash.
 * @param bits - The SHA-3 bit length (224, 256, 384, or 512).
 *
 * @returns A promise that resolves to the hash as a Uint8Array.
 */
async function sha3Hash(data: Uint8Array, bits: Sha3): Promise<Uint8Array> {
    let hex: string;
    switch (bits) {
        case 224:
            hex = sha3_224(data as any) as unknown as string;
            break;
        case 256:
            hex = sha3_256(data as any) as unknown as string;
            break;
        case 384:
            hex = sha3_384(data as any) as unknown as string;
            break;
        case 512:
            hex = sha3_512(data as any) as unknown as string;
            break;
        default:
            throw new Error(`Unsupported SHA-3 bit length: ${bits}`);
    }
    return hexToBytes(hex);
}

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
    let hex: string;
    switch (bits) {
        case 128:
            hex = shake128(data as any, outputLengthInBits) as unknown as string;
            break;
        case 256:
            hex = shake256(data as any, outputLengthInBits) as unknown as string;
            break;
        default:
            throw new Error(`Unsupported SHAKE bit length: ${bits}`);
    }
    return hexToBytes(hex);
}

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
    let hex: string;
    switch (bits) {
        case 128:
            hex = cshake128(data as any, outputLengthInBits, functionName, customization) as unknown as string;
            break;
        case 256:
            hex = cshake256(data as any, outputLengthInBits, functionName, customization) as unknown as string;
            break;
        default:
            throw new Error(`Unsupported cSHAKE bit length: ${bits}`);
    }
    return hexToBytes(hex);
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
    cShakeHash as cshakeHash
}