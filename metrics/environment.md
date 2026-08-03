# Environment

Captured 2026-08-03, before any generation run. Every number published in the README was produced on
this machine with this software. Recorded so the results can be read as a dated observation rather
than a general claim.

| Component | Version |
|---|---|
| macOS | 14.6 (arm64, Apple silicon) |
| Node.js | v26.0.0 |
| npm | 11.12.1 |
| Claude Code CLI | 2.1.220 |
| Generator model | `claude-opus-5` (pinned full ID, not the `opus` alias, which can drift) |
| `@playwright/test` | 1.62.1 (exact pin) |
| Test-run browser | Playwright Chromium build 1234 (bundled with 1.62.1) |
| `@playwright/mcp` | 0.0.78 (exact pin) |
| MCP browser | Chrome Headless Shell 151.0.7922.10 (chrome-for-testing, playwright build 1232) |
| `eslint-plugin-playwright` | 2.11.0 (exact pin) |
| ESLint | 10.8.0 |
| TypeScript | 6.0.3 |
| Target app | https://demo.playwright.dev/todomvc/ — static GitHub Pages, title `React • TodoMVC` |

The generator model is pinned by full ID for the same reason the packages are: an alias that silently
points at a newer model partway through would break the comparison between arms, and the whole claim
rests on the two arms differing by exactly one thing.

Note that the browser the agent *explores* with (chrome-for-testing via MCP) is not the same build as
the browser the tests *run* in (Playwright's bundled Chromium 1234). Both are Chromium and render this
app identically, but it is a real difference and is recorded rather than glossed over.
