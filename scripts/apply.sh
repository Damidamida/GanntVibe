#!/usr/bin/env bash
set -euo pipefail

EXPECTED_SHA="4d450f668c5b63f9d2270968abbafc353b460c47"
RUN_CHECKS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --expected-sha) shift; EXPECTED_SHA="${1:-$EXPECTED_SHA}";;
    --run-checks) RUN_CHECKS=1;;
  esac
  shift || true
done

node "scripts/applyHelpers/applyFiles.mjs" --expectedSha="$EXPECTED_SHA" $([ "$RUN_CHECKS" -eq 1 ] && echo "--runChecks=1")
