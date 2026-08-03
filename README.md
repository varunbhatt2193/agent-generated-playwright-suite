# Agent-Generated Playwright Suite

Generate an end-to-end Playwright suite with Claude Code and the official Playwright MCP server —
then **measure what the agent got wrong**. First-run pass rate, flake across repeated runs, and a
taxonomy of the specific ways generated tests fail. Then do it again with a Claude Skill encoding
test conventions, and report whether the skill actually changed anything.

Plenty of people have pointed an agent at an app and gotten tests out. The receipts are the point
here: every raw generated file, every session transcript, every repair, and a measurement protocol
written down *before* the first run.

**Status:** in progress. Harness and protocol are in place; generation has not yet run. No results
are published yet, and nothing in this README will ever be ahead of the files in `metrics/`.

## The question

Does a Claude Skill encoding Playwright conventions measurably change the quality of an
agent-generated test suite — and in which specific ways?

## Method

The full pre-registered protocol is in **[`docs/protocol.md`](docs/protocol.md)**, frozen at the
`protocol-frozen` tag before any generation ran. In short:

- **Target:** [`demo.playwright.dev/todomvc`](https://demo.playwright.dev/todomvc) — Playwright's own
  demo app. It is known-good and static, so a failing test means the *test* is wrong. That is the
  only reason the measurement means anything.
- **Two arms, one variable.** Arm A generates with no skill loaded. Arm B is identical plus a
  `playwright-conventions` skill. Same frozen [prompt](prompts/generation-prompt.md), same target,
  same pinned model, fresh session each run.
- **Three runs per arm**, each in a clean git worktree, all raw output committed untouched before
  anything is read or edited. LLM output varies; one run per arm would be an anecdote.
- **Metrics defined in advance:** tests generated, first-run pass rate, flake rate over 10
  consecutive runs, isolation and parallel failures, convention violations (a pinned
  `eslint-plugin-playwright` rule set), and manual repair rate.
- **Retries are 0 everywhere, including CI.** Retries would hide exactly the flake being measured.

Defining "needed repair" after seeing the results is how you accidentally get the answer you wanted,
so all the definitions were written first and are in the protocol.

## Results

Numbers appear here once measured. Nothing in this README is ever ahead of `metrics/`.

## Layout

| Path | What it holds |
|---|---|
| `docs/protocol.md` | Pre-registered measurement protocol — frozen before generation |
| `prompts/generation-prompt.md` | The frozen prompt, identical for every run in both arms |
| `smoke/` | One hand-written smoke test, proving the harness works without the agent |
| `arms/a-baseline/`, `arms/b-skill/` | Raw generated output per run, committed untouched, plus repairs |
| `logs/` | Full session transcript for every generation run |
| `metrics/` | Measurement output — the source for every number published here |
| `.claude/skills/playwright-conventions/` | The skill under test |
| `tests/` | The suite that runs in CI, promoted from repaired output |

## Reproduce

```bash
npm ci
npx playwright install chromium
npm run test:smoke     # the hand-written harness check
npm run lint           # the convention gate
```

## Honest limits

Written up front so they are not mistaken for an afterthought: this is one target app, one model, one
prompt, and three runs per arm. It measures what this agent did on this app on these dates — not
agent-generated tests in general.
