#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm typecheck
pnpm lint
pnpm build:all
