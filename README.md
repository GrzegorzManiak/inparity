# inparity

A small, pragmatic cross-language parity library. The goal isn’t to re‑invent crypto or utilities, it’s to provide a standard set of functions that behave the same and are called the same across languages. Today this repo ships Go and TypeScript implementations that match on inputs, outputs, naming, and semantics, with shared test vectors to keep them in parity.

Why? Because building apps that touch encoding, hashing, and (soon) key operations gets a lot easier when your Go backend and TS frontend share the exact same building blocks.

- Current languages: Go, TypeScript
- Scope today: bytes helpers, numeric helpers, URL‑safe base64, SHA‑2/SHA‑3/SHAKE/cSHAKE
- Next up: message signing, key generation, ECC ops, and more

## Design principles

- API parity: the same function names and behavior in each language (following each language’s casing conventions)
  - Go: `util.BytesToBigInt`, `util.EncUrlSafe`, `util.Sha2Hash`, …
  - TS: `bytesToBigInt`, `encUrlSafe`, `sha2Hash`, …
- Deterministic I/O:
  - Input types: `[]byte`/`Uint8Array`, `big.Int`/`bigint`, `string`
  - Output types: `[]byte` in Go, `Uint8Array` in TS (or `string` when encoding)
- Verified parity: both languages use the same test vectors (`testdata/parity.json`) and mirror test suites
- Lean dependencies: built on the standard library (Go) and `@noble/hashes` (TS) for well‑reviewed, audited primitives

## What’s included

Utilities are grouped under a `util` namespace in both languages.

- Bytes
  - Go: `util.BytesToBigInt`, `util.BigIntToByteArray`, `util.IntToBytes`, `util.ConcatBytes`, `util.FramedBytesFromUint8Array`, `util.FramedBytesFromBigInt`, `util.FramedBytesFromString`, `util.FramedBytes`
  - TS: `bytesToBigInt`, `bigIntToByteArray`, `intToBytes`, `concatBytes`, `framedBytesFromUint8Array`, `framedBytesFromBigInt`, `framedBytesFromString`, `framedBytes`
- Numeric
  - Go: `util.BigModPos`, `util.BigCmp`
  - TS: `bigModPos`, `bigCmp`
- Coding (Base64 URL‑safe, no padding)
  - Go: `util.EncUrlSafe`, `util.DecUrlSafe`
  - TS: `encUrlSafe`, `decUrlSafe`
- Hashing
  - SHA‑2: `Sha2Hash` / `sha2Hash` with bits `256 | 384 | 512`
  - SHA‑3 (FIPS): `Sha3Hash` / `sha3Hash` with bits `224 | 256 | 384 | 512`
  - SHAKE (XOF): `ShakeHash` / `shakeHash` with capacity `128 | 256` and arbitrary output length in bits
  - cSHAKE: `CShakeHash` / `cShakeHash` with capacity `128 | 256`, output length in bits, plus function‑name and customization strings

## Install and use

Go
- Minimum Go: 1.24
- Module: `github.com/grzegorzmaniak/inparity`
- Import packages (examples):
  - `github.com/grzegorzmaniak/inparity/util`

Example

```go
import (
    "fmt"
    "github.com/grzegorzmaniak/inparity/util"
)

func main() {
    out, _ := util.Sha2Hash([]byte("hello"), 256)
    fmt.Printf("sha256: %x\n", out)
}
```

TypeScript
- Runtime: Node 18+ or modern browsers
- Package: `ts/` workspace contains the TS implementation and tests
- Dependency: uses `@noble/hashes` under the hood

Local usage (from this repo)

```bash
cd ts
npm i
npm test
```

Importing in your app
- The package is structured for publishing as `inparity` (see `ts/package.json`). Until it’s published, you can vendor or link the `ts/src` into your build as needed.

Quick TS example

```ts
import { Util } from "inparity"; // when published
// or: import * as Util from "./path/to/inparity/ts/src/util";

const bytes = new TextEncoder().encode("hello");
const hash = await Util.sha2Hash(bytes, 256);
console.log(Buffer.from(hash).toString("hex"));
```

## Parity contract

When we say “parity,” we mean:
- Function names and parameters match across languages (allowing for idiomatic casing)
- Inputs/outputs are equivalent types (`[]byte` ↔ `Uint8Array`, `big.Int` ↔ `bigint`)
- Behavior matches on all edge cases (empty inputs, negative values where applicable, length framing, output lengths for XOFs, etc.)
- Changes in one language require mirrored changes and tests in the other

## Testing

This repo includes mirrored test suites and shared vectors.

- Go
  - `cd go && go test ./...`
- TypeScript
  - `cd ts && npm test`

The test vector file `testdata/parity.json` is consumed by the TS tests; Go tests mirror the behavior directly in Go.

## Roadmap

- Message signing (ed25519, ECDSA)
- Key generation and serialization
- ECC operations and utilities
- KDFs and MACs where useful (HKDF/HMAC parity wrappers)

If you’d like a language added (e.g., Python, Rust, Java, Swift), feel free to contribute, see below.

## Contributing

We welcome contributions that keep parity tight and the surface area minimal.

- Additions checklist
  - Implement the function in both Go and TS with the same name and semantics
  - Add/extend test vectors in `testdata/parity.json` where applicable
  - Add unit tests in `go/util/*_test.go` and `ts/tests/**`
  - Update this README with the new API
- New languages
  - Keep the same module naming and function names (use idiomatic casing)
  - Mirror tests using the same vector format; ensure round‑trip parity with Go/TS

## Security

This project wraps well‑reviewed primitives (`crypto/sha*` and `golang.org/x/crypto/sha3` in Go; `@noble/hashes` in TS). It does not introduce novel cryptography. Use responsibly, and please file issues if you spot any inconsistency or edge‑case mismatch.

## License

GPL‑3.0, see `LICENSE`.

