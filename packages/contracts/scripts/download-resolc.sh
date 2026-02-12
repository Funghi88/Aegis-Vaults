#!/bin/bash
# Download resolc binary for macOS (avoids plugin download / proxy issues)
# Run from packages/contracts: ./scripts/download-resolc.sh

set -e
BIN_DIR="$(cd "$(dirname "$0")/.." && pwd)/bin"
URL="https://github.com/paritytech/revive/releases/download/v0.6.0/resolc-universal-apple-darwin"
OUT="$BIN_DIR/resolc-universal-apple-darwin"

mkdir -p "$BIN_DIR"
echo "Downloading resolc to $OUT ..."
curl -L -o "$OUT" "$URL"
xattr -c "$OUT"
chmod +x "$OUT"
echo "Done. Run: npm run compile:revive"
