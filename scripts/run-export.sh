#!/bin/bash
# Simple helper script to run the export with environment variables
set -euo pipefail

# Load environment variables from .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs -d '\n')
fi

node dist/export.js "$@"
