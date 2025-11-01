/**
 * Returns the positive modulus of x mod n.
 *
 * @param x - The number to be reduced.
 * @param n - The modulus.
 *
 * @returns bigint - The positive modulus of x mod n.
 */
function bigModPos(x: bigint, n: bigint): bigint {
    return ((x % n) + n) % n;
}

/**
 * Compares two bigint values.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 *
 * @returns number - Returns -1 if a < b, 1 if a > b, and 0 if a == b.
 */
function bigCmp(a: bigint, b: bigint): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

export {
    bigModPos,
    bigCmp
};