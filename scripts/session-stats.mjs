#!/usr/bin/env node
//
// Summarises every generation transcript in logs/ — turns, wall clock, cost, tool usage, and
// whether the arm B sessions actually invoked the skill.
//
//   node scripts/session-stats.mjs [outDir]
//
// The skill-invocation check is not bookkeeping: the protocol discards an arm B run whose session
// never loaded the skill, because such a run is a second arm A wearing the wrong label.
//
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const outDir = process.argv[2] ?? join(repoRoot, 'metrics');
mkdirSync(outDir, { recursive: true });

const logDir = join(repoRoot, 'logs');
const files = readdirSync(logDir).filter((f) => f.endsWith('.jsonl')).sort();

const rows = files.map((f) => {
  const raw = readFileSync(join(logDir, f), 'utf8');
  const lines = raw.trim().split('\n');
  const tools = {};
  let result = null;
  for (const l of lines) {
    let o;
    try {
      o = JSON.parse(l);
    } catch {
      continue;
    }
    if (o.type === 'result') result = o;
    const content = o?.message?.content;
    if (Array.isArray(content)) {
      for (const b of content) if (b.type === 'tool_use') tools[b.name] = (tools[b.name] ?? 0) + 1;
    }
  }
  const mcpCalls = Object.entries(tools)
    .filter(([k]) => k.startsWith('mcp__playwright__'))
    .reduce((a, [, v]) => a + v, 0);
  return {
    run: f.replace('.jsonl', ''),
    turns: result?.num_turns ?? null,
    seconds: result?.duration_ms ? Math.round(result.duration_ms / 1000) : null,
    costUsd: result?.total_cost_usd ?? null,
    mcpCalls,
    toolCalls: tools,
    // A skill shows up in the transcript by name once the session loads it.
    skillMentioned: /playwright-conventions/.test(raw),
  };
});

writeFileSync(join(outDir, 'sessions.json'), JSON.stringify(rows, null, 2));

const md = [
  '# Generation sessions',
  '',
  'One row per generation run, read from the committed transcripts in `logs/`.',
  '',
  '| Run | Turns | Wall clock | Cost | MCP browser calls | Skill loaded |',
  '|---|---|---|---|---|---|',
  ...rows.map(
    (r) =>
      `| \`${r.run}\` | ${r.turns ?? '—'} | ${r.seconds ? r.seconds + 's' : '—'} | ${r.costUsd != null ? '$' + r.costUsd.toFixed(2) : '—'} | ${r.mcpCalls} | ${r.skillMentioned ? 'yes' : 'no'} |`,
  ),
  '',
  `Total generation cost: $${rows.reduce((a, r) => a + (r.costUsd ?? 0), 0).toFixed(2)}.`,
  '',
  '## Tool usage per run',
  '',
  ...rows.flatMap((r) => [
    `**\`${r.run}\`** — ` +
      Object.entries(r.toolCalls)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k.replace('mcp__playwright__', 'mcp:')} ${v}`)
        .join(', '),
    '',
  ]),
].join('\n');
writeFileSync(join(outDir, 'sessions.md'), md);

console.log(md);
