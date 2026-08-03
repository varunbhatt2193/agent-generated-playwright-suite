# CLAUDE.md

This repo is an experiment, not just a test suite: generate a Playwright suite with Claude Code and
the Playwright MCP server, measure what the agent got wrong, and A/B a conventions Skill. The
measurement protocol in `docs/protocol.md` is frozen (tag `protocol-frozen`) — read it before
touching anything measurement-related.

## Hard rules

- **Never edit anything under `arms/*/run-*/`.** That is raw agent output, the primary evidence.
  Repairs happen only in `arms/<arm>/repaired/`, and every repair gets a line in that arm's
  `REPAIRS.md`.
- **Never set `retries` above 0** or add retry logic anywhere, including CI. Retries hide the flake
  this project measures.
- **Never change `docs/protocol.md` or `prompts/generation-prompt.md`** after the `protocol-frozen`
  tag. If a change seems necessary, stop and ask the user — it invalidates the comparison.
- **No numbers in `README.md` that don't come from files in `metrics/`.** Unmeasured claims are the
  one thing this repo exists to avoid.
- **Builder sessions never write or edit test files during the generation phases.** Generation
  happens only in fresh headless sessions launched by `scripts/generate-arm.sh`.
- `planning/` is gitignored and stays that way.

## Commands

- `npm test` — run the CI suite in `tests/`
- `PW_TEST_DIR=<dir> npm test` — run any suite (e.g. `smoke`, `arms/a-baseline/run-1`)
- `PW_WORKERS=1 PW_TEST_DIR=<dir> npm test` — sequential run, as used for measurement
- `npm run lint` — the convention gate (eslint-plugin-playwright)
- `node scripts/measure.mjs <suiteDir> <outDir>` — 10 runs + isolation + parallel probe → summary
- `node scripts/lint-suite.mjs <suiteDir> <outDir>` — gate + informational rules + grep suspects
- `scripts/generate-arm.sh <a|b> <n>` — one generation run in a throwaway export of the tagged base

## Layout

- `smoke/` — one hand-written smoke test proving the harness (kept deliberately trivial: goto + title)
- `arms/{a-baseline,b-skill}/run-{1..3}/` — raw generated output, frozen
- `arms/*/repaired/` — run-1 copies repaired to green + lint-clean, with `REPAIRS.md`
- `tests/` — the CI suite (promoted repaired arm, per protocol decision rules)
- `prompts/`, `docs/protocol.md` — pre-registered experiment inputs
- `logs/` — session transcripts (stream-json) per generation run
- `metrics/` — measurement outputs, committed
- `.claude/skills/playwright-conventions/` — the Skill under test (exists only after arm A finishes)
