package util

import (
	"encoding/hex"
	"encoding/json"
	"math/big"
	"os"
	"path/filepath"
	"testing"
)

type parityVectors struct {
	Numeric struct {
		Mod []struct{ X, N, R string }
		Cmp []struct {
			A, B string
			C    int
		}
	}
	Bytes struct {
		BytesToBigInt     []struct{ Bytes, Bigint string }
		BigIntToByteArray []struct {
			Bigint, Bytes string
			WantErr       bool
		}
		IntToBytes []struct {
			I       int64
			Len     int
			Bytes   string
			WantErr bool
		}
		Concat          []struct{ A, B, Out string }
		FramedFromBytes []struct {
			Data     string
			LenBytes int
			Frame    string
			WantErr  bool
		}
		FramedFromBigInt []struct {
			Value    string
			LenBytes int
			Frame    string
		}
		FramedFromString []struct {
			Str      string
			LenBytes int
			Frame    string
			WantErr  bool
		}
	}
	Coding struct {
		Encode []struct{ Bytes, B64 string }
		Decode []struct{ B64, Bytes string }
	}
}

func loadVectors(t *testing.T) parityVectors {
	t.Helper()
	path := filepath.Join("..", "..", "testdata", "parity.json")
	f, err := os.Open(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	var v parityVectors
	if err := json.NewDecoder(f).Decode(&v); err != nil {
		t.Fatal(err)
	}
	return v
}

func mustBigInt(s string) *big.Int {
	z := new(big.Int)
	if _, ok := z.SetString(s, 10); !ok {
		panic("bad big int")
	}
	return z
}

func mustHex(s string) []byte {
	if s == "" {
		return []byte{}
	}
	b, err := hex.DecodeString(s)
	if err != nil {
		panic(err)
	}
	return b
}

func TestParity_Numeric(t *testing.T) {
	v := loadVectors(t)
	for _, tc := range v.Numeric.Mod {
		got := BigModPos(mustBigInt(tc.X), mustBigInt(tc.N))
		if got.Cmp(mustBigInt(tc.R)) != 0 {
			t.Fatalf("mod x=%s n=%s: got %s want %s", tc.X, tc.N, got, tc.R)
		}
	}
	for _, tc := range v.Numeric.Cmp {
		if got := BigCmp(mustBigInt(tc.A), mustBigInt(tc.B)); got != tc.C {
			t.Fatalf("cmp a=%s b=%s: got %d want %d", tc.A, tc.B, got, tc.C)
		}
	}
}

func TestParity_Bytes(t *testing.T) {
	v := loadVectors(t)
	for _, tc := range v.Bytes.BytesToBigInt {
		got := BytesToBigInt(mustHex(tc.Bytes))
		if got.Cmp(mustBigInt(tc.Bigint)) != 0 {
			t.Fatalf("bytesToBigInt %s: got %s want %s", tc.Bytes, got, tc.Bigint)
		}
	}
	for _, tc := range v.Bytes.BigIntToByteArray {
		b, err := BigIntToByteArray(mustBigInt(tc.Bigint))
		if tc.WantErr {
			if err == nil {
				t.Fatalf("bigIntToByteArray %s: expected error", tc.Bigint)
			}
			continue
		}
		if err != nil {
			t.Fatal(err)
		}
		if hex.EncodeToString(b) != tc.Bytes {
			t.Fatalf("bigIntToByteArray %s: got %x want %s", tc.Bigint, b, tc.Bytes)
		}
	}
	for _, tc := range v.Bytes.IntToBytes {
		b, err := IntToBytes(tc.I, tc.Len)
		if tc.WantErr {
			if err == nil {
				t.Fatalf("intToBytes %d,%d: expected error", tc.I, tc.Len)
			}
			continue
		}
		if err != nil {
			t.Fatal(err)
		}
		if hex.EncodeToString(b) != tc.Bytes {
			t.Fatalf("intToBytes %d,%d: got %x want %s", tc.I, tc.Len, b, tc.Bytes)
		}
	}
	for _, tc := range v.Bytes.Concat {
		out := ConcatBytes(mustHex(tc.A), mustHex(tc.B))
		if hex.EncodeToString(out) != tc.Out {
			t.Fatalf("concat %s + %s => %x want %s", tc.A, tc.B, out, tc.Out)
		}
	}
	for _, tc := range v.Bytes.FramedFromBytes {
		fr, err := FramedBytesFromUint8Array(mustHex(tc.Data), tc.LenBytes)
		if tc.WantErr {
			if err == nil {
				t.Fatalf("framedFromBytes lenBytes=%d: expected error", tc.LenBytes)
			}
			continue
		}
		if err != nil {
			t.Fatal(err)
		}
		if hex.EncodeToString(fr) != tc.Frame {
			t.Fatalf("framedFromBytes %s: got %x want %s", tc.Data, fr, tc.Frame)
		}
	}
	for _, tc := range v.Bytes.FramedFromBigInt {
		fr, err := FramedBytesFromBigInt(mustBigInt(tc.Value), tc.LenBytes)
		if err != nil {
			t.Fatal(err)
		}
		if hex.EncodeToString(fr) != tc.Frame {
			t.Fatalf("framedFromBigInt %s: got %x want %s", tc.Value, fr, tc.Frame)
		}
	}
	for _, tc := range v.Bytes.FramedFromString {
		fr, err := FramedBytesFromString(tc.Str, tc.LenBytes)
		if tc.WantErr {
			if err == nil {
				t.Fatalf("framedFromString lenBytes=%d: expected error", tc.LenBytes)
			}
			continue
		}
		if err != nil {
			t.Fatal(err)
		}
		if hex.EncodeToString(fr) != tc.Frame {
			t.Fatalf("framedFromString %s: got %x want %s", tc.Str, fr, tc.Frame)
		}
	}
}

func TestParity_Coding(t *testing.T) {
	v := loadVectors(t)
	for _, tc := range v.Coding.Encode {
		got := EncUrlSafe(mustHex(tc.Bytes))
		if got != tc.B64 {
			t.Fatalf("encode %s: got %s want %s", tc.Bytes, got, tc.B64)
		}
	}
	for _, tc := range v.Coding.Decode {
		got, err := DecUrlSafe(tc.B64)
		if err != nil {
			t.Fatalf("decode %s: %v", tc.B64, err)
		}
		if hex.EncodeToString(got) != tc.Bytes {
			t.Fatalf("decode %s: got %x want %s", tc.B64, got, tc.Bytes)
		}
	}
}
