/**
 * Converts a Uint8Array to a BigInt.
 *
 * @param bytes - The byte array to convert.
 *
 * @returns bigint - The resulting BigInt.
 */
function bytesToBigInt(bytes: Uint8Array): bigint {
    let result = 0n;
    for (const byte of bytes) result = (result << 8n) + BigInt(byte);
    return result;
}

/**
 * @note This function assumes a big-endian representation.
 *
 * Converts a BigInt to a Uint8Array.
 *
 * @throws {RangeError} - If the input BigInt is negative.
 *
 * @param value - The BigInt to convert.
 *
 * @returns Uint8Array - The resulting byte array.
 */
function bigIntToByteArray(value: bigint): Uint8Array {
    if (value < 0n) {
        throw new RangeError("bigIntToByteArray only supports non-negative values");
    }

    if (value === 0n) {
        return new Uint8Array([0]);
    }

    const bytes: number[] = [];
    let v = value;

    while (v > 0n) {
        bytes.push(Number(v & 0xffn));
        v >>= 8n;
    }

    bytes.reverse();

    return new Uint8Array(bytes);
}

/**
 * @note This function returns the big-endian representation.
 * @important For lengths greater than 53 bits this function may not work as expected due to JavaScript's number limitations.
 *
 * Converts an integer to a Uint8Array of specified byte length.
 *
 * @throws {RangeError} - If the input integer is negative or exceeds the safe integer range.
 *
 * @param i - The integer to convert.
 * @param byteLength - The desired byte length of the output array.
 *
 * @returns Uint8Array - The resulting byte array.
 */
function intToBytes(i: number, byteLength: number): Uint8Array {
    if (i < 0) throw new RangeError("intToBytes only supports non-negative integers");
    if (!Number.isSafeInteger(i)) throw new RangeError("Input exceeds 53-bit safe integer range");

    const bytes = new Uint8Array(byteLength);
    let value = BigInt(i);

    for (let b = byteLength - 1; b >= 0; b--) {
        bytes[b] = Number(value & 0xffn);
        value >>= 8n;
    }

    return bytes;
}

/**
 * Concatenates multiple Uint8Array instances into a single Uint8Array.
 *
 * @param arrays - The arrays to concatenate.
 *
 * @returns Uint8Array - The concatenated byte array.
 */
function concatBytes(...arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }

    return result;
}

/**
 * @note This function assumes a big-endian representation.
 *
 * Creates a framed byte array with a length prefix.
 *
 * @param data - The data to frame.
 * @param lengthPrefixBytes - The number of bytes to use for the length prefix.
 *
 * @returns Uint8Array - The framed byte array.
 */
function framedBytesFromUint8Array(data: Uint8Array, lengthPrefixBytes: number): Uint8Array {
    return concatBytes(intToBytes(data.length, lengthPrefixBytes), data);
}

/**
 * @note This function assumes a big-endian representation.
 *
 * Creates a framed byte array from a BigInt with a length prefix. This framing includes a sign byte which reflects
 * the GoLang implementation.
 *
 * @param value - The BigInt value to frame.
 * @param lengthPrefixBytes - The number of bytes to use for the length prefix.
 *
 * @returns Uint8Array - The framed byte array.
 */
function framedBytesFromBigInt(value: bigint, lengthPrefixBytes: number): Uint8Array {
    const isNegative = value < 0n ? 1 : 0;
    const magnitude = bigIntToByteArray(isNegative ? -value : value);
    return concatBytes(
        intToBytes(magnitude.length, lengthPrefixBytes),
        new Uint8Array([isNegative]),
        magnitude
    );
}

/**
 * @note This function assumes a big-endian representation.
 *
 * Creates a framed byte array from a string with a length prefix.
 *
 * @param str - The string to frame.
 * @param lengthPrefixBytes - The number of bytes to use for the length prefix.
 *
 * @returns Uint8Array - The framed byte array.
 */
function framedBytesFromString(str: string, lengthPrefixBytes: number): Uint8Array {
    const bytes = new TextEncoder().encode(str);
    return concatBytes(intToBytes(bytes.length, lengthPrefixBytes), bytes);
}

/**
 * @note This function assumes a big-endian representation.
 *
 * Generic function to create a framed byte array from various input types with a length prefix.
 * The default length prefix size is 4 bytes.
 *
 * @param input - The input data to frame (Uint8Array, bigint, or string).
 * @param lengthPrefixBytes - The number of bytes to use for the length prefix (default is 4).
 *
 * @returns Uint8Array - The framed byte array.
 */
function framedBytes(input: Uint8Array | bigint | string, lengthPrefixBytes: number = 4): Uint8Array {
    if (input instanceof Uint8Array)  return framedBytesFromUint8Array(input, lengthPrefixBytes);
    else if (typeof input === "bigint")  return framedBytesFromBigInt(input, lengthPrefixBytes);
    else return framedBytesFromString(input, lengthPrefixBytes);
}

export {
    bytesToBigInt,
    bigIntToByteArray,
    intToBytes,
    concatBytes,
    framedBytesFromUint8Array,
    framedBytesFromBigInt,
    framedBytesFromString,
    framedBytes
};