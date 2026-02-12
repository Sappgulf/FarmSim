#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: bash scripts/subagents/cleanup.sh [run-id] [--delete-branches]

Removes worktrees created for a sub-agent run.

Options:
  --delete-branches   Also delete run branches after removing worktrees
  --help              Show this help
USAGE
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNS_ROOT="$ROOT_DIR/.subagents/runs"
DELETE_BRANCHES=0
RUN_ID=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --delete-branches)
      DELETE_BRANCHES=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      if [[ -n "$RUN_ID" ]]; then
        echo "Only one run id may be provided." >&2
        exit 1
      fi
      RUN_ID="$1"
      shift
      ;;
  esac
done

if [[ -z "$RUN_ID" ]]; then
  if [[ -f "$RUNS_ROOT/latest" ]]; then
    RUN_ID="$(cat "$RUNS_ROOT/latest")"
  else
    echo "No run id provided and no latest run marker found." >&2
    exit 1
  fi
fi

RUN_DIR="$RUNS_ROOT/$RUN_ID"
META_FILE="$RUN_DIR/agents.tsv"

if [[ ! -f "$META_FILE" ]]; then
  echo "Run metadata not found: $META_FILE" >&2
  exit 1
fi

while IFS=$'\t' read -r agent branch worktree agent_dir; do
  [[ -z "$agent" ]] && continue

  if [[ -d "$worktree" ]]; then
    git -C "$ROOT_DIR" worktree remove "$worktree" --force >/dev/null || true
    echo "Removed worktree [$agent]: $worktree"
  else
    echo "Worktree already missing [$agent]: $worktree"
  fi

  if [[ "$DELETE_BRANCHES" -eq 1 ]]; then
    if git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$branch"; then
      git -C "$ROOT_DIR" branch -D "$branch" >/dev/null || true
      echo "Deleted branch [$agent]: $branch"
    fi
  fi
done < "$META_FILE"
