# Sub-Agents Workflow

Run parallel Codex agents in isolated git worktrees.

## Roles
- `debug`: find and reproduce defects; add failing regression tests when needed.
- `fix`: implement targeted bug fixes and re-verify.
- `improve`: make quality/perf/accessibility improvements.
- `scout`: focus on other high-leverage opportunities.

## Commands
```bash
npm run agents:run
npm run agents:status
npm run agents:cleanup
```

## Useful options
```bash
bash scripts/subagents/run-parallel.sh --agents debug,fix
bash scripts/subagents/run-parallel.sh --base main --model gpt-5
bash scripts/subagents/run-parallel.sh --cleanup-worktrees
bash scripts/subagents/status.sh 20260212-120000
bash scripts/subagents/cleanup.sh 20260212-120000 --delete-branches
```

## Output layout
- Run artifacts: `.subagents/runs/<run-id>/`
- Per-agent logs: `.subagents/runs/<run-id>/<agent>/`
- Worktrees: `.subagents/worktrees/<run-id>-<agent>/`
- Summary file: `.subagents/runs/<run-id>/summary.md`
