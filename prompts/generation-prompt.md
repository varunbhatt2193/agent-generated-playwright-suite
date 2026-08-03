# Generation prompt

Frozen before any run; identical for every run in both arms. The text between the rules below is the
**entire** prompt each generation session receives. No follow-up messages, no steering. It deliberately
says what to build, not how to build it — locator choice, waiting strategy, structure, and coverage
judgment are the agent's, because that judgment is what the experiment measures.

---

This repo has Playwright set up: TypeScript, @playwright/test, Chromium, config in
playwright.config.ts. The app under test is https://demo.playwright.dev/todomvc — a standard
TodoMVC implementation.

Write an end-to-end test suite for this app.

- First explore the app with the Playwright MCP browser tools to learn its actual behavior. Don't
  work from assumptions about how TodoMVC apps usually behave.
- Cover the features you find thoroughly.
- Put all test files under tests/ in this repo. Don't change playwright.config.ts and don't add
  dependencies.
- The suite should pass when you're done: run it with `npx playwright test` and fix what fails.

When finished, reply with a one-paragraph summary of what you covered.

---
