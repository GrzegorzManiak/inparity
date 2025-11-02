package util

import (
	"crypto/sha256"
	"crypto/sha512"
	"errors"

	"golang.org/x/crypto/sha3"
)

// Sha2Hash computes SHA-2 hash with 256, 384, or 512 bits.
func Sha2Hash(data []byte, bits int) ([]byte, error) {
	switch bits {
	case 256:
		h := sha256.Sum256(data)
		out := make([]byte, len(h))
		copy(out, h[:])
		return out, nil
	case 384:
		h := sha512.Sum384(data)
		out := make([]byte, len(h))
		copy(out, h[:])
		return out, nil
	case 512:
		h := sha512.Sum512(data)
		out := make([]byte, len(h))
		copy(out, h[:])
		return out, nil
	default:
		return nil, errors.New("unsupported SHA-2 bit length")
	}
}

// Sha3Hash computes SHA-3 hash with 224, 256, 384, or 512 bits.
func Sha3Hash(data []byte, bits int) ([]byte, error) {
	switch bits {
	case 224:
		h := sha3.Sum224(data)
		out := make([]byte, len(h))
		copy(out, h[:])
		return out, nil
	case 256:
		h := sha3.Sum256(data)
		out := make([]byte, len(h))
		copy(out, h[:])
		return out, nil
	case 384:
		h := sha3.Sum384(data)
		out := make([]byte, len(h))
		copy(out, h[:])
		return out, nil
	case 512:
		h := sha3.Sum512(data)
		out := make([]byte, len(h))
		copy(out, h[:])
		return out, nil
	default:
		return nil, errors.New("unsupported SHA-3 bit length")
	}
}

// ShakeHash computes SHAKE with 128 or 256 capacity and outputLenBits length.
func ShakeHash(data []byte, bits int, outputLenBits int) ([]byte, error) {
	if outputLenBits%8 != 0 {
		return nil, errors.New("output length must be a multiple of 8 bits")
	}
	outLen := outputLenBits / 8
	out := make([]byte, outLen)
	switch bits {
	case 128:
		h := sha3.NewShake128()
		if _, err := h.Write(data); err != nil {
			return nil, err
		}
		if _, err := h.Read(out); err != nil {
			return nil, err
		}
		return out, nil
	case 256:
		h := sha3.NewShake256()
		if _, err := h.Write(data); err != nil {
			return nil, err
		}
		if _, err := h.Read(out); err != nil {
			return nil, err
		}
		return out, nil
	default:
		return nil, errors.New("unsupported SHAKE bit length")
	}
}

// CShakeHash computes cSHAKE with 128 or 256 capacity and outputLenBits length.
// functionName is provided by caller (N), customization is S.
func CShakeHash(data []byte, bits int, outputLenBits int, functionName string, customization string) ([]byte, error) {
	if outputLenBits%8 != 0 {
		return nil, errors.New("output length must be a multiple of 8 bits")
	}
	outLen := outputLenBits / 8
	out := make([]byte, outLen)
	n := []byte(functionName)
	s := []byte(customization)
	switch bits {
	case 128:
		h := sha3.NewCShake128(n, s)
		if _, err := h.Write(data); err != nil {
			return nil, err
		}
		if _, err := h.Read(out); err != nil {
			return nil, err
		}
		return out, nil
	case 256:
		h := sha3.NewCShake256(n, s)
		if _, err := h.Write(data); err != nil {
			return nil, err
		}
		if _, err := h.Read(out); err != nil {
			return nil, err
		}
		return out, nil
	default:
		return nil, errors.New("unsupported cSHAKE bit length")
	}
}
