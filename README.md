# Playwright with AI: course project

This project is used in the AI for Product Owners and QA course (Day 6). You will write and run Playwright tests against the Orion Shop, a small practice shop that runs on your own computer.

## What is in here

- `shop-app/`: the Orion Shop. You do not need to change it.
- `tests/`: example tests, and a test file with a TODO for the session.
- `playwright.config.ts`: starts the shop for you when you run the tests.
- `.github/`: a workflow that runs the tests on GitHub.

## One-time set-up

1. Install Node.js LTS (version 18 or newer). Check with `node --version`.
2. Install VS Code.
3. In a terminal, from this folder, run:

```
npm install
npx playwright install chromium
```

## Check that it works

```
npx playwright test
```

You should see 3 tests pass.

To open the HTML report after a run:

```
npx playwright show-report
```

## Run the shop by itself

```
npm run shop
```

The shop runs at http://localhost:3000. Keep this terminal open while you explore it in a browser.

## Your task

Open `tests/cart.spec.ts` and follow the TODO comment at the top. Write the tests it describes, read every line before you run them, and run them with `npx playwright test`.

If a test fails because the shop behaves differently from the rule you were given, that is a bug report, not a broken test. Note the exact steps and what you saw.
