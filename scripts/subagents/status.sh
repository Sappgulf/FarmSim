#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNS_ROOT="$ROOT_DIR/.subagents/runs"

if [[ ! -d "$RUNS_ROOT" ]]; then
  echo "No runs yet: $RUNS_ROOT"
  exit 0
fi

RUN_ID="${1:-}"
if [[ -z "$RUN_ID" ]]; then
  if [[ -f "$RUNS_ROOT/latest" ]]; then
    RUN_ID="$(cat "$RUNS_ROOT/latest")"
  else
    RUN_ID="$(ls -1 "$RUNS_ROOT" | tail -n 1)"
  fi
fi

RUN_DIR="$RUNS_ROOT/$RUN_ID"
SUMMARY_FILE="$RUN_DIR/summary.md"

if [[ ! -d "$RUN_DIR" ]]; then
  echo "Run not found: $RUN_ID"
  echo "Available runs:"
  ls -1 "$RUNS_ROOT" || true
  exit 1
fi

if [[ -f "$SUMMARY_FILE" ]]; then
  cat "$SUMMARY_FILE"
else
  echo "Run directory exists but summary not found: $SUMMARY_FILE"
  ls -la "$RUN_DIR"
fi
