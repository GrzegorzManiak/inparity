package util

import (
	"encoding/hex"
	"math/big"
	"testing"
)

func TestBytesToBigInt_BigEndian(t *testing.T) {
	got := BytesToBigInt([]byte{0x01, 0x02})
	want := big.NewInt(0)
	want.SetBytes([]byte{0x01, 0x02})
	if got.Cmp(want) != 0 {
		t.Fatalf("got %s want %s", got, want)
	}
}

func TestBigIntToByteArray(t *testing.T) {
	// zero
	z := big.NewInt(0)
	b, err := BigIntToByteArray(z)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hex.EncodeToString(b) != "00" {
		t.Fatalf("zero encoding wrong: %x", b)
	}

	// positive
	v := big.NewInt(0)
	v.SetString("0102", 16)
	b, err = BigIntToByteArray(v)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hex.EncodeToString(b) != "0102" {
		t.Fatalf("encoding wrong: %x", b)
	}

	// negative should error
	neg := big.NewInt(-1)
	if _, err := BigIntToByteArray(neg); err == nil {
		t.Fatalf("expected error for negative input")
	}
}

func TestIntToBytes(t *testing.T) {
	b, err := IntToBytes(0, 1)
	if err != nil || len(b) != 1 || b[0] != 0x00 {
		t.Fatalf("0 -> 1 byte failed: %v %x", err, b)
	}

	b, err = IntToBytes(258, 2)
	if err != nil || hex.EncodeToString(b) != "0102" {
		t.Fatalf("258 -> 2 bytes failed: %v %x", err, b)
	}

	// overflow
	if _, err := IntToBytes(256, 1); err == nil {
		t.Fatalf("expected overflow error")
	}

	// negative
	if _, err := IntToBytes(-1, 1); err == nil {
		t.Fatalf("expected negative error")
	}
}

func TestConcatBytes(t *testing.T) {
	out := ConcatBytes([]byte{0x01}, []byte{0x02, 0x03})
	if hex.EncodeToString(out) != "010203" {
		t.Fatalf("concat failed: %x", out)
	}
}

func TestFramedBytesFromUint8Array(t *testing.T) {
	data := []byte{0xAA, 0xBB}
	fr, err := FramedBytesFromUint8Array(data, 2)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hex.EncodeToString(fr) != "0002aabb" {
		t.Fatalf("framed wrong: %x", fr)
	}
}

func TestFramedBytesFromBigInt(t *testing.T) {
	v := big.NewInt(0x0102)
	fr, err := FramedBytesFromBigInt(v, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// length=2, sign=0, magnitude=0102
	if hex.EncodeToString(fr) != "02000102" {
		t.Fatalf("framed wrong: %x", fr)
	}

	neg := big.NewInt(-258)
	fr, err = FramedBytesFromBigInt(neg, 1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hex.EncodeToString(fr) != "02010102" {
		t.Fatalf("negative framed wrong: %x", fr)
	}
}

func TestFramedBytesDispatcher(t *testing.T) {
	// []byte
	b, err := FramedBytes([]byte{0xAA}, 1)
	if err != nil || hex.EncodeToString(b) != "01aa" {
		t.Fatalf("[]byte dispatch failed: %v %x", err, b)
	}
	// *big.Int
	bi := big.NewInt(1)
	b, err = FramedBytes(bi, 1)
	if err != nil || hex.EncodeToString(b) != "010001" {
		t.Fatalf("*big.Int dispatch failed: %v %x", err, b)
	}
	// string
	b, err = FramedBytes("A", 1)
	if err != nil || hex.EncodeToString(b) != "0141" {
		t.Fatalf("string dispatch failed: %v %x", err, b)
	}
}
