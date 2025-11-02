package util

import (
	"encoding/hex"
	"testing"
)

func TestUrlSafeBase64_RoundTripASCII(t *testing.T) {
	data := []byte("hello")
	enc := EncUrlSafe(data)
	if enc != "aGVsbG8" { // "aGVsbG8=" without padding
		t.Fatalf("unexpected encoding: %s", enc)
	}
	dec, err := DecUrlSafe(enc)
	if err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if string(dec) != "hello" {
		t.Fatalf("unexpected decode: %q", dec)
	}
}

func TestUrlSafeBase64_PaddingRemovalAndRestoration(t *testing.T) {
	bytes := []byte{0x01, 0x02}
	enc := EncUrlSafe(bytes)
	if enc != "AQI" { // standard base64 "AQI=" -> url-safe without padding
		t.Fatalf("unexpected encoding: %s", enc)
	}
	dec, err := DecUrlSafe(enc)
	if err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if hex.EncodeToString(dec) != "0102" {
		t.Fatalf("unexpected decode: %x", dec)
	}
}

func TestUrlSafeBase64_NonAsciiAndUrlReplacements(t *testing.T) {
	bytes := []byte{0xff, 0xee, 0xdd, 0xcc, 0xbb, 0xaa, 0x99, 0x88, 0x77, 0x66, 0x55, 0x44}
	enc := EncUrlSafe(bytes)
	// standard base64 would be "/+7dzLuqmYh3ZlVE"; url-safe replaces + with - and / with _ and omits padding
	if enc != "_-7dzLuqmYh3ZlVE" {
		t.Fatalf("unexpected encoding: %s", enc)
	}
	dec, err := DecUrlSafe(enc)
	if err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if hex.EncodeToString(dec) != "ffeeddccbbaa998877665544" {
		t.Fatalf("unexpected decode: %x", dec)
	}
}
