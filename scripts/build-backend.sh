#!/bin/bash

# Exit on error
set -e

# Get script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create logs directory if it doesn't exist
if [[ ! -d $DIR/logs ]]; then
    mkdir -p "$DIR/logs"
fi

# Generate and copy did
echo "Generating Candid interface"
cargo test -p backend generate_candid \
    > $DIR/logs/build-backend.log 2>&1

# Run dfx generate
echo "Running dfx generate"
dfx generate backend \
    >> $DIR/logs/build-backend.log 2>&1

# Build wasm
echo "Building wasm"

BUILD_DIR="target/wasm32-unknown-unknown/release"

dfx build backend \
    >> $DIR/logs/build-backend.log 2>&1

# Create distributed directory if it doesn't exist
mkdir -p src/distributed/backend

# Copy and compress wasm
gzip --best -c $BUILD_DIR/backend.wasm > src/distributed/backend/backend.wasm.gz

echo "Build OK!"
