#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm -C packages/mobile exec cap add ios >/dev/null 2>&1 || true
pnpm build:ios
