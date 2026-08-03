# Generation sessions

One row per generation run, read from the committed transcripts in `logs/`.

| Run | Turns | Wall clock | Cost | MCP browser calls | Skill loaded |
|---|---|---|---|---|---|
| `a-run-1` | 44 | 569s | $2.64 | 21 | no |
| `a-run-2` | 32 | 519s | $2.01 | 11 | no |
| `a-run-3` | 115 | 786s | $4.87 | 89 | no |

Total generation cost: $9.52.

## Tool usage per run

**`a-run-1`** — mcp:browser_run_code_unsafe 18, Bash 9, Write 8, Edit 4, ToolSearch 1, mcp:browser_navigate 1, mcp:browser_type 1, mcp:browser_evaluate 1

**`a-run-2`** — mcp:browser_run_code_unsafe 8, Write 7, Bash 6, Read 3, Edit 3, ToolSearch 1, mcp:browser_navigate 1, mcp:browser_type 1, mcp:browser_evaluate 1

**`a-run-3`** — mcp:browser_evaluate 38, mcp:browser_click 20, mcp:browser_type 17, Write 9, Bash 7, Edit 6, mcp:browser_navigate 5, ToolSearch 3, mcp:browser_press_key 3, mcp:browser_snapshot 2, mcp:browser_hover 2, mcp:browser_navigate_back 1, mcp:browser_console_messages 1
