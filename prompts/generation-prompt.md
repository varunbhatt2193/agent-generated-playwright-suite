# The generation prompt

The literal prompt is **[`task.txt`](task.txt)** — that file is what `scripts/generate-arm.sh` pipes
into `claude -p`, byte for byte, and it is the only instruction any generation session receives. There
are no follow-up messages and no steering. This file explains the design; it is never sent to the
agent.

Two properties matter, and both are easy to get wrong:

**It says what to build, not how.** No guidance on locators, waiting, structure, or coverage depth.
That guidance is the experimental variable — it is exactly what the arm B skill supplies — so putting
any of it in the shared prompt would shrink the very difference the experiment sets out to measure.

**It is kept separate from the explanation.** The prompt lives alone in a plain text file rather than
being quoted inside a document like this one, because a script that extracts a prompt from prose is a
script that can silently send the prose too. Feeding the agent a paragraph about how it is being
measured would change what it writes.

The prompt does tell the agent to explore the live app first and to run the suite before finishing.
Both are deliberate: that is how these tools are actually used, and a prompt that forbade them would
measure a workflow nobody ships.
