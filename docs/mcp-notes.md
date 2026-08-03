# Playwright MCP — what this project actually runs

Recorded on 2026-08-03 against the pinned server, because the upstream project moves quickly and its
README documents whatever is current rather than what any given version does. Everything below was
observed from `@playwright/mcp@0.0.78` on this machine, not read from documentation.

## Configuration

`.mcp.json` (committed, so both arms provably launch the same server):

```json
{ "command": "npx",
  "args": ["-y", "@playwright/mcp@0.0.78", "--browser", "chromium", "--headless", "--isolated"] }
```

- **Pinned to 0.0.78, not `@latest`.** A server upgrade partway through would silently change the
  agent's capabilities between arms and make the comparison meaningless.
- **`--browser chromium`** resolves to the pinned `chrome-for-testing` download
  (Chrome Headless Shell 151.0.7922.10, playwright build v1232), *not* the machine's Google Chrome.
  Chrome auto-updates; a pinned build keeps the browser a fixed quantity across all six runs. This is
  not obvious — the `--help` text lists only `chrome, firefox, webkit, msedge` as values, and passing
  `chromium` fails with `Browser "chrome-for-testing" is not installed` until you run
  `npx @playwright/mcp@0.0.78 install-browser chrome-for-testing` once.
- **`--headless`** because generation runs unattended (the server is headed by default).
- **`--isolated`** keeps the browser profile in memory, so no cookies or localStorage survive from one
  generation run into the next. Without it, run 2 could inherit run 1's todo list.

## Capabilities as of 0.0.78

`--caps` accepts only `vision`, `pdf`, `devtools` in this version. The `testing`, `network`, `storage`
and `config` groups described in the current upstream README **do not exist here** — that README
documents a later version. Nothing is passed, so all three optional groups stay off.

`--codegen` defaults to `typescript` in this version and is left alone. It is worth being explicit
that this is *not* an off switch being left off: the server ships with code generation on, and the
baseline should reflect what a developer actually gets rather than a configuration tuned for the
experiment.

## Tools observed

24 tools, all prefixed `mcp__playwright__`, confirmed by a live session:

`browser_click`, `browser_close`, `browser_console_messages`, `browser_drag`, `browser_drop`,
`browser_evaluate`, `browser_file_upload`, `browser_fill_form`, `browser_find`,
`browser_handle_dialog`, `browser_hover`, `browser_navigate`, `browser_navigate_back`,
`browser_network_request`, `browser_network_requests`, `browser_press_key`, `browser_resize`,
`browser_run_code_unsafe`, `browser_select_option`, `browser_snapshot`, `browser_tabs`,
`browser_take_screenshot`, `browser_type`, `browser_wait_for`

The server drives the page through Playwright's accessibility tree rather than pixels:
`browser_snapshot` returns a structured node list with refs, and screenshots are only taken when
explicitly requested.

## Verification

The wiring was proved before any generation run, with a throwaway headless session:

```bash
claude -p "navigate to https://demo.playwright.dev/todomvc/ and take an accessibility snapshot ..." \
  --model claude-opus-5 --mcp-config .mcp.json --allowedTools "mcp__playwright__*"
```

It returned the new-todo input's accessible name (`What needs to be done?`) and the `todos` heading —
values read off the live page, which is the only way to know the tools genuinely work end to end.

Note for reproducing: `claude -p` does **not** load a project `.mcp.json` automatically, so
`--mcp-config .mcp.json` is required. Interactive sessions do load it, gated on approval, which
`.claude/settings.local.json` grants locally (uncommitted, since approval state is per-machine).
