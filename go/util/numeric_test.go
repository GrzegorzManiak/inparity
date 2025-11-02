package util

import (
	"math/big"
	"testing"
)

func TestBigModPos(t *testing.T) {
	// n > 0 is assumed
	n := big.NewInt(5)

	cases := []struct {
		x      int64
		expect int64
	}{
		{0, 0},
		{1, 1},
		{4, 4},
		{5, 0},
		{6, 1},
		{-1, 4},
		{-6, 4},
		{-10, 0},
	}

	for _, c := range cases {
		got := BigModPos(big.NewInt(c.x), n)
		if got.Cmp(big.NewInt(c.expect)) != 0 {
			t.Fatalf("x=%d: got %s want %d", c.x, got.String(), c.expect)
		}
	}

	// Large values
	largeX := new(big.Int)
	largeX.SetString("1234567890123456789012345678901234567890", 10)
	largeN := big.NewInt(97)
	got := BigModPos(largeX, largeN)
	// Compute expected using standard Mod then adjust to [0,n)
	exp := new(big.Int).Mod(largeX, largeN)
	if exp.Sign() < 0 {
		exp.Add(exp, largeN)
	}
	if got.Cmp(exp) != 0 {
		t.Fatalf("large: got %s want %s", got, exp)
	}
}

func TestBigCmp(t *testing.T) {
	cases := []struct {
		a, b   int64
		expect int
	}{
		{-2, -1, -1},
		{-1, -1, 0},
		{-1, 0, -1},
		{0, 0, 0},
		{1, 0, 1},
		{1, 2, -1},
		{2, 1, 1},
	}
	for _, c := range cases {
		ga := big.NewInt(c.a)
		gb := big.NewInt(c.b)
		if got := BigCmp(ga, gb); got != c.expect {
			t.Fatalf("Cmp(%d,%d) got %d want %d", c.a, c.b, got, c.expect)
		}
	}

	// Large numbers comparison
	A := new(big.Int)
	B := new(big.Int)
	A.SetString("123456789012345678901234567890", 10)
	B.SetString("123456789012345678901234567891", 10)
	if got := BigCmp(A, B); got != -1 {
		t.Fatalf("large cmp expected -1, got %d", got)
	}
}
