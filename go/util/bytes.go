package util

import (
	"errors"
	"math/big"
)

// BytesToBigInt converts a slice of bytes into a big.Int (big-endian).
func BytesToBigInt(b []byte) *big.Int {
	bi := new(big.Int)
	bi.SetBytes(b)
	return bi
}

// BigIntToByteArray converts a non-negative *big.Int to a big-endian byte slice.
// Returns []byte{0} for zero. Returns an error for negative or nil input.
func BigIntToByteArray(v *big.Int) ([]byte, error) {
	if v == nil {
		return nil, errors.New("BigIntToByteArray: input is nil")
	}
	if v.Sign() < 0 {
		return nil, errors.New("BigIntToByteArray only supports non-negative values")
	}
	if v.Sign() == 0 {
		return []byte{0}, nil
	}
	return v.Bytes(), nil
}

// IntToBytes converts a non-negative integer to a big-endian byte slice of fixed length.
// Returns an error if the integer is negative or doesn't fit into the specified byte length.
func IntToBytes(i int64, byteLen int) ([]byte, error) {
	if byteLen <= 0 {
		return nil, errors.New("IntToBytes: byteLen must be positive")
	}
	if i < 0 {
		return nil, errors.New("IntToBytes only supports non-negative integers")
	}

	v := big.NewInt(i)
	limit := new(big.Int).Lsh(big.NewInt(1), uint(8*byteLen))
	if v.Cmp(limit) >= 0 {
		return nil, errors.New("IntToBytes: input does not fit in the requested byte length")
	}

	out := make([]byte, byteLen)
	for b := byteLen - 1; b >= 0; b-- {
		out[b] = byte(new(big.Int).And(v, big.NewInt(0xff)).Uint64())
		v.Rsh(v, 8)
	}
	return out, nil
}

// ConcatBytes concatenates multiple byte slices into one.
func ConcatBytes(arrays ...[]byte) []byte {
	total := 0
	for _, a := range arrays {
		total += len(a)
	}
	res := make([]byte, total)
	offset := 0
	for _, a := range arrays {
		copy(res[offset:], a)
		offset += len(a)
	}
	return res
}

// FramedBytesFromUint8Array prefixes the length (big-endian) of data using lengthPrefixBytes.
func FramedBytesFromUint8Array(data []byte, lengthPrefixBytes int) ([]byte, error) {
	prefix, err := IntToBytes(int64(len(data)), lengthPrefixBytes)
	if err != nil {
		return nil, err
	}
	return ConcatBytes(prefix, data), nil
}

// FramedBytesFromBigInt creates a framed byte array from a big.Int.
// Format: [length (lengthPrefixBytes)][sign byte (0 or 1)][magnitude bytes]
func FramedBytesFromBigInt(value *big.Int, lengthPrefixBytes int) ([]byte, error) {
	if value == nil {
		return nil, errors.New("FramedBytesFromBigInt: value is nil")
	}
	isNegative := byte(0)
	v := new(big.Int).Set(value)
	if v.Sign() < 0 {
		isNegative = 1
		v.Abs(v)
	}
	magnitude, err := BigIntToByteArray(v)
	if err != nil {
		return nil, err
	}
	prefix, err := IntToBytes(int64(len(magnitude)), lengthPrefixBytes)
	if err != nil {
		return nil, err
	}
	return ConcatBytes(prefix, []byte{isNegative}, magnitude), nil
}

// FramedBytesFromString creates a framed byte array from a UTF-8 string.
func FramedBytesFromString(s string, lengthPrefixBytes int) ([]byte, error) {
	bytes := []byte(s) // Go strings are UTF-8 encoded
	return FramedBytesFromUint8Array(bytes, lengthPrefixBytes)
}

// FramedBytes is a generic dispatcher. Input can be []byte, *big.Int, or string.
// lengthPrefixBytes specifies number of bytes used for the length prefix.
func FramedBytes(input interface{}, lengthPrefixBytes int) ([]byte, error) {
	switch v := input.(type) {
	case []byte:
		return FramedBytesFromUint8Array(v, lengthPrefixBytes)
	case *big.Int:
		return FramedBytesFromBigInt(v, lengthPrefixBytes)
	case string:
		return FramedBytesFromString(v, lengthPrefixBytes)
	default:
		return nil, errors.New("FramedBytes: unsupported input type")
	}
}
