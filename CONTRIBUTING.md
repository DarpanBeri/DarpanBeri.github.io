# Contributing

This repository enforces an “AI cleanup and guardrails” workflow. All PRs must pass formatting, linting, validation, tests, coverage, and accessibility checks.

## Identity

- Only personal identity is allowed for this repo.
- Local git config is set per-repo:  
  user.name "Darpan Beri", user.email "darpanberi.99@gmail.com".
- Keep the remote host as github.com (personal). Do not push with work identity.

## Branching & PRs

- Use feature branches from the latest `main`.
- PR titles should follow Conventional Commits (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`).
- PRs must include/updated tests and keep/increase coverage.
- PRs must pass CI checks (lint, unit tests, html/a11y/link validation, coverage, E2E).

## Local development

- Serve locally with a static server (e.g., VS Code Live Server or `npx http-server -p 8080 -c-1 .`).
- Run format and lint before pushing.
- Husky pre-commit hooks will auto-run format/lint on changed files (added in PR 2).

Common commands (will be added in PR 2):
- `npm run format` / `npm run format:check` — Prettier formatting.
- `npm run lint` — ESLint + Stylelint + Markdownlint and custom cleanup checks.
- `npm run test` / `npm run test:coverage` — Jest unit tests with coverage.
- `npm run serve` — Local HTTP server for manual testing.

## Clean code & security

- No inline JavaScript (e.g., `onclick=`); attach event listeners from `assets/js/script.js`.
- External links with `target="_blank"` must include `rel="noopener noreferrer"`.
- Prefer semantic HTML elements (`<button>` over `div role="button">`).
- Accessibility is required (labels, `aria-live` for status, keyboard navigation).
- Respect CSP best practices (move inline scripts to JS files, avoid `unsafe-inline`).

## Testing

- Unit tests: Jest + jsdom (with coverage).
- Accessibility fragments: jest-axe on key components.
- E2E smoke: Playwright for core flows (navigation, theme toggle, form validation).

## Performance

- Lighthouse CI with budgets (Performance ≥ 90; Total JS ≤ 250 KB).

## Documentation

- Keep README and SPEC updated when behavior or tooling changes.
- Add screenshots for UI changes in PRs.

## CI

- GitHub Actions will run lint, format check, validation, tests with coverage (uploaded to Codecov), a11y, links, and E2E (where applicable).
- PRs are blocked until CI succeeds and required reviews are completed.
