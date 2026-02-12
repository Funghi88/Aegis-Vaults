#!/bin/bash
# Start local Revive dev node for deploy:revive
# Prerequisite: polkadot-sdk built at ~/polkadot-sdk (or set POLKADOT_SDK_PATH)

POLKADOT_SDK="${POLKADOT_SDK_PATH:-$HOME/polkadot-sdk}"
BIN="$POLKADOT_SDK/target/release/revive-dev-node"

if [[ ! -f "$BIN" ]]; then
  echo "revive-dev-node not found. Build first:"
  echo "  cd $POLKADOT_SDK"
  echo "  cargo build -p revive-dev-node --bin revive-dev-node --release"
  exit 1
fi

echo "Starting Revive dev node on ws://127.0.0.1:9944"
"$BIN" --dev
