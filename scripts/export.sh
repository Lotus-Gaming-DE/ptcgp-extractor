#!/usr/bin/env bash
# Simple helper to run the export script.
# Usage: ./scripts/export.sh [args]
set -euo pipefail
node dist/export.js "$@"
