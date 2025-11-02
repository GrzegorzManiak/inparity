package util

import "math/big"

// BigModPos returns x modulo n as a non-negative result.
// x is the dividend, n is the modulus. The result is in [0, n).
func BigModPos(x, n *big.Int) *big.Int {
	mod := new(big.Int).Mod(x, n)
	if mod.Sign() < 0 {
		mod.Add(mod, n)
	}
	return mod
}

// BigCmp Compares two big.Int values.
// Returns -1 if a < b, 0 if a == b, and 1 if a > b.
func BigCmp(a, b *big.Int) int {
	return a.Cmp(b)
}
