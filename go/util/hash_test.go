package util

import (
	"encoding/hex"
	"testing"
)

func hexStr(b []byte) string { return hex.EncodeToString(b) }

func TestSha2Hash(t *testing.T) {
	cases := []struct {
		msg  string
		bits int
		want string
	}{
		{"", 256, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},
		{"abc", 256, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"},
		{"", 384, "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b"},
		{"", 512, "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"},
	}
	for _, c := range cases {
		got, err := Sha2Hash([]byte(c.msg), c.bits)
		if err != nil {
			t.Fatalf("sha2 err: %v", err)
		}
		if hexStr(got) != c.want {
			t.Fatalf("sha2 %d,%q: got %s want %s", c.bits, c.msg, hexStr(got), c.want)
		}
	}
}

func TestSha3Hash(t *testing.T) {
	cases := []struct {
		msg  string
		bits int
		want string
	}{
		{"", 224, "6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7"},
		{"The quick brown fox jumps over the lazy dog", 224, "d15dadceaa4d5d7bb3b48f446421d542e08ad8887305e28d58335795"},
		{"", 256, "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"},
		{"The quick brown fox jumps over the lazy dog", 256, "69070dda01975c8c120c3aada1b282394e7f032fa9cf32f4cb2259a0897dfc04"},
		{"", 384, "0c63a75b845e4f7d01107d852e4c2485c51a50aaaa94fc61995e71bbee983a2ac3713831264adb47fb6bd1e058d5f004"},
		{"", 512, "a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a615b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26"},
	}
	for _, c := range cases {
		got, err := Sha3Hash([]byte(c.msg), c.bits)
		if err != nil {
			t.Fatalf("sha3 err: %v", err)
		}
		if hexStr(got) != c.want {
			t.Fatalf("sha3 %d,%q: got %s want %s", c.bits, c.msg, hexStr(got), c.want)
		}
	}
}

func TestShakeHash(t *testing.T) {
	cases := []struct {
		msg       string
		bits, out int
		want      string
	}{
		{"", 128, 256, "7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26"},
		{"", 256, 512, "46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762fd75dc4ddd8c0f200cb05019d67b592f6fc821c49479ab48640292eacb3b7c4be"},
	}
	for _, c := range cases {
		got, err := ShakeHash([]byte(c.msg), c.bits, c.out)
		if err != nil {
			t.Fatalf("shake err: %v", err)
		}
		if hexStr(got) != c.want {
			t.Fatalf("shake %d,%d: got %s want %s", c.bits, c.out, hexStr(got), c.want)
		}
	}
}

func TestCShakeHash(t *testing.T) {
	cases := []struct {
		msg            string
		bits, out      int
		fn, cust, want string
	}{
		{"", 128, 256, "", "", "7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26"},
		{"", 256, 512, "", "", "46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762fd75dc4ddd8c0f200cb05019d67b592f6fc821c49479ab48640292eacb3b7c4be"},
	}
	for _, c := range cases {
		got, err := CShakeHash([]byte(c.msg), c.bits, c.out, c.fn, c.cust)
		if err != nil {
			t.Fatalf("cshake err: %v", err)
		}
		if hexStr(got) != c.want {
			t.Fatalf("cshake %d,%d,%q,%q: got %s want %s", c.bits, c.out, c.fn, c.cust, hexStr(got), c.want)
		}
	}
}
