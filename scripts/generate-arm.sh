#!/usr/bin/env bash
#
# One generation run. Usage: scripts/generate-arm.sh <a|b> <run-number>
#
# The agent works in a throwaway export of the tagged generation base, NOT a checkout of this repo.
# That matters more than it looks: a git worktree would carry this repo's history, README, protocol
# and CLAUDE.md into the session — and Claude Code loads CLAUDE.md automatically — so the agent would
# know it was being measured and could read the exact rubric it was about to be scored against. The
# export is a plain directory with no .git at all, holding only the harness.
#
set -euo pipefail

ARM="${1:?usage: generate-arm.sh <a|b> <run-number>}"
RUN="${2:?usage: generate-arm.sh <a|b> <run-number>}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$ARM" in
  a) TAG="gen-base-a"; DEST="$REPO/arms/a-baseline/run-$RUN" ;;
  b) TAG="gen-base-b"; DEST="$REPO/arms/b-skill/run-$RUN" ;;
  *) echo "arm must be a or b" >&2; exit 1 ;;
esac

if [ -e "$DEST" ]; then
  echo "$DEST already exists — refusing to overwrite raw output" >&2
  exit 1
fi
git -C "$REPO" rev-parse -q --verify "$TAG^{commit}" >/dev/null || {
  echo "tag $TAG does not exist" >&2; exit 1; }

WT="$(mktemp -d)/gen-$ARM-$RUN"
mkdir -p "$WT"
git -C "$REPO" archive "$TAG" | tar -x -C "$WT"

echo "generating: arm $ARM run $RUN"
echo "  base:     $TAG ($(git -C "$REPO" rev-parse --short "$TAG"))"
echo "  workdir:  $WT"

cd "$WT"
npm ci --silent

# Bash is allowed so the agent can run the suite it writes; edits are auto-accepted because a
# headless session has no one to answer a permission prompt.
set +e
claude -p "$(cat "$REPO/prompts/task.txt")" \
  --model claude-opus-5 \
  --mcp-config "$REPO/.mcp.json" \
  --permission-mode acceptEdits \
  --allowedTools "mcp__playwright__*" "Bash" "Read" "Write" "Edit" "Glob" "Grep" \
  --output-format stream-json --verbose \
  > session.jsonl 2> session.stderr
STATUS=$?
set -e
if [ $STATUS -ne 0 ]; then
  echo "WARNING: claude exited $STATUS — salvaging whatever it produced" >&2
fi

mkdir -p "$DEST" "$REPO/logs"
if [ -d "$WT/tests" ] && ls "$WT/tests"/*.ts >/dev/null 2>&1; then
  cp -R "$WT/tests/." "$DEST/"
else
  echo "WARNING: no .ts files under tests/ — committing the transcript as evidence anyway" >&2
fi

cp "$WT/session.jsonl" "$REPO/logs/$ARM-run-$RUN.jsonl"
if [ -s "$WT/session.stderr" ]; then
  cp "$WT/session.stderr" "$REPO/logs/$ARM-run-$RUN.stderr"
fi

# Anything the agent created outside tests/ is deliberately not collected; it dies with the temp dir.
echo
echo "raw output:  $DEST"
echo "transcript:  $REPO/logs/$ARM-run-$RUN.jsonl"
echo "files:       $(ls -1 "$DEST" 2>/dev/null | wc -l | tr -d ' ')"
echo
echo "Commit this UNTOUCHED before reading or editing anything."
