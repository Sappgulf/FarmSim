#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: bash scripts/subagents/run-parallel.sh [options]

Run multiple Codex sub-agents in parallel, each in its own git worktree.

Options:
  --agents <csv>        Comma-separated roles (default: debug,fix,improve,scout)
  --base <ref>          Base git ref for new branches (default: HEAD)
  --run-id <id>         Custom run id (default: timestamp)
  --model <name>        Override model passed to codex exec
  --sandbox <mode>      Codex sandbox mode (default: workspace-write)
  --no-full-auto        Do not pass --full-auto to codex exec
  --cleanup-worktrees   Remove worktrees after run completes
  --help                Show this help
USAGE
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROMPTS_DIR="$ROOT_DIR/scripts/subagents/prompts"
RUNS_ROOT="$ROOT_DIR/.subagents/runs"
WORKTREES_ROOT="$ROOT_DIR/.subagents/worktrees"

AGENTS_CSV="debug,fix,improve,scout"
BASE_REF="HEAD"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
SANDBOX_MODE="workspace-write"
FULL_AUTO=1
CLEANUP_WORKTREES=0
MODEL="${CODEX_MODEL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agents)
      AGENTS_CSV="${2:-}"
      shift 2
      ;;
    --base)
      BASE_REF="${2:-}"
      shift 2
      ;;
    --run-id)
      RUN_ID="${2:-}"
      shift 2
      ;;
    --model)
      MODEL="${2:-}"
      shift 2
      ;;
    --sandbox)
      SANDBOX_MODE="${2:-}"
      shift 2
      ;;
    --no-full-auto)
      FULL_AUTO=0
      shift
      ;;
    --cleanup-worktrees)
      CLEANUP_WORKTREES=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! command -v codex >/dev/null 2>&1; then
  echo "codex CLI not found in PATH." >&2
  exit 1
fi

if ! git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repo: $ROOT_DIR" >&2
  exit 1
fi

if ! git -C "$ROOT_DIR" rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "Invalid base ref: $BASE_REF" >&2
  exit 1
fi

mkdir -p "$RUNS_ROOT" "$WORKTREES_ROOT"
RUN_DIR="$RUNS_ROOT/$RUN_ID"
mkdir -p "$RUN_DIR"
printf '%s\n' "$RUN_ID" > "$RUNS_ROOT/latest"

unique_branch_name() {
  local base="$1"
  local candidate="$base"
  local counter=1

  while git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$candidate"; do
    candidate="${base}-${counter}"
    counter=$((counter + 1))
  done

  printf '%s' "$candidate"
}

IFS=',' read -r -a RAW_AGENTS <<< "$AGENTS_CSV"
AGENTS=()
for raw in "${RAW_AGENTS[@]}"; do
  agent="$(printf '%s' "$raw" | tr -d '[:space:]')"
  [[ -z "$agent" ]] && continue
  AGENTS+=("$agent")
done

if [[ "${#AGENTS[@]}" -eq 0 ]]; then
  echo "No agents selected. Use --agents debug,fix,improve,scout" >&2
  exit 1
fi

echo "Starting sub-agent run: $RUN_ID"
echo "Base ref: $BASE_REF"
echo "Agents: ${AGENTS[*]}"
echo "Run output: $RUN_DIR"

META_FILE="$RUN_DIR/agents.tsv"
: > "$META_FILE"

PIDS=()
LAUNCHED_AGENTS=()
LAUNCHED_BRANCHES=()
LAUNCHED_WORKTREES=()
LAUNCHED_DIRS=()

for agent in "${AGENTS[@]}"; do
  prompt_file="$PROMPTS_DIR/$agent.md"
  if [[ ! -f "$prompt_file" ]]; then
    echo "Missing prompt file: $prompt_file" >&2
    exit 1
  fi

  branch_base="subagent/${RUN_ID}-${agent}"
  branch="$(unique_branch_name "$branch_base")"
  worktree="$WORKTREES_ROOT/${RUN_ID}-${agent}"
  agent_dir="$RUN_DIR/$agent"

  if [[ -e "$worktree" ]]; then
    echo "Worktree path already exists: $worktree" >&2
    exit 1
  fi

  mkdir -p "$agent_dir"
  cp "$prompt_file" "$agent_dir/prompt.md"

  git -C "$ROOT_DIR" worktree add -b "$branch" "$worktree" "$BASE_REF" >/dev/null

  printf '%s\t%s\t%s\t%s\n' "$agent" "$branch" "$worktree" "$agent_dir" >> "$META_FILE"

  cmd=(codex exec -C "$worktree" -s "$SANDBOX_MODE")
  if [[ "$FULL_AUTO" -eq 1 ]]; then
    cmd+=(--full-auto)
  fi
  if [[ -n "$MODEL" ]]; then
    cmd+=(-m "$MODEL")
  fi
  cmd+=(--output-last-message "$agent_dir/final.md" --json -)

  (
    "${cmd[@]}" < "$agent_dir/prompt.md" > "$agent_dir/events.jsonl" 2>&1
  ) &

  pid=$!
  PIDS+=("$pid")
  LAUNCHED_AGENTS+=("$agent")
  LAUNCHED_BRANCHES+=("$branch")
  LAUNCHED_WORKTREES+=("$worktree")
  LAUNCHED_DIRS+=("$agent_dir")

  printf '%s\n' "$pid" > "$agent_dir/pid"
  echo "Launched [$agent] pid=$pid branch=$branch"
done

SUMMARY_FILE="$RUN_DIR/summary.md"
{
  echo "# Sub-agent Run $RUN_ID"
  echo
  echo "- Base ref: \`$BASE_REF\`"
  echo "- Agents: \`${AGENTS[*]}\`"
  echo "- Started: \`$(date)\`"
  echo
} > "$SUMMARY_FILE"

overall_exit=0

for i in "${!PIDS[@]}"; do
  pid="${PIDS[$i]}"
  agent="${LAUNCHED_AGENTS[$i]}"
  branch="${LAUNCHED_BRANCHES[$i]}"
  worktree="${LAUNCHED_WORKTREES[$i]}"
  agent_dir="${LAUNCHED_DIRS[$i]}"

  if wait "$pid"; then
    exit_code=0
  else
    exit_code=$?
    overall_exit=1
  fi

  diff_file="$agent_dir/changes.patch"
  git -C "$worktree" diff --binary > "$diff_file"

  status_file="$agent_dir/status.txt"
  git -C "$worktree" status --short > "$status_file"

  {
    echo "## $agent"
    echo "- Exit code: \`$exit_code\`"
    echo "- Branch: \`$branch\`"
    echo "- Worktree: \`$worktree\`"
    echo "- Prompt: \`$agent_dir/prompt.md\`"
    echo "- Final message: \`$agent_dir/final.md\`"
    echo "- Events log: \`$agent_dir/events.jsonl\`"
    echo "- Patch: \`$agent_dir/changes.patch\`"
    if [[ -s "$status_file" ]]; then
      echo "- Working tree changes:"
      echo '```text'
      cat "$status_file"
      echo '```'
    else
      echo "- Working tree changes: none"
    fi
    echo
  } >> "$SUMMARY_FILE"

  if [[ "$CLEANUP_WORKTREES" -eq 1 ]]; then
    git -C "$ROOT_DIR" worktree remove "$worktree" --force >/dev/null || true
  fi

done

if [[ "$CLEANUP_WORKTREES" -eq 1 ]]; then
  echo "Removed run worktrees (--cleanup-worktrees enabled)."
fi

echo "Run finished: $RUN_ID"
echo "Summary: $SUMMARY_FILE"

exit "$overall_exit"
