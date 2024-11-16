#!/bin/bash

echo "Deploying Internet Identity..."
dfx deploy internet_identity

echo "Running Cargo tests to generate Candid file..."
cargo test -p backend generate_candid

sleep 2

echo "Deploying Backend Canister..."
dfx deploy backend
