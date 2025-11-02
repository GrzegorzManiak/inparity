package util

import "encoding/base64"

// EncUrlSafe encodes data into URL-safe base64 without padding.
func EncUrlSafe(data []byte) string {
	return base64.RawURLEncoding.EncodeToString(data)
}

// DecUrlSafe decodes a URL-safe base64 string without padding.
func DecUrlSafe(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}
