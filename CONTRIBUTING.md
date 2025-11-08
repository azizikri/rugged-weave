# Contributing to Rugged Weave

Thank you for helping build Rugged Weave! This guide aligns with Google’s engineering review practices and our plan in `PLAN.md`.

## Getting Started
1. Fork the repository and create a branch that matches `feature/<slug>` from `task_breakdown.md`.
2. Run `bun install` to install dependencies.
3. Use `bun run dev` or the scoped Turbo commands for local development.

## Commit & Branch Standards
- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for every commit. Examples:
  - `feat: add fade journal reactions`
  - `fix: guard webhook signature parsing`
- Husky and commitlint enforce the format automatically.
- Keep commits and PRs small, atomic, and focused on a single checklist item from `PLAN_ISSUES.md`.

## Code Review Expectations
We adopt Google’s [engineering code review guidance](https://google.github.io/eng-practices/review/) and [standard](https://google.github.io/eng-practices/review/reviewer/standard.html):
- Reviewers evaluate design, functionality, complexity, tests, naming, comments, style, and documentation updates.
- Authors should provide context, test evidence, and screenshots for UI changes.
- A change is ready to merge when it clearly improves code health even if not perfect—iterate quickly on feedback.

## Testing & Quality Gates
- Run `bun run check` and any package-level tests relevant to your change.
- Update or add automated tests. Include unit, integration, and E2E coverage per feature test plans in `PLAN.md`.
- Ensure documentation updates accompany code changes that affect behaviour.

## Pull Request Checklist
- Reference the relevant issue from `PLAN_ISSUES.md`.
- Summarize the change, include before/after evidence, and list tests executed.
- Confirm security considerations, referencing OWASP Top 10 items affected.

## Releases
- Semantic-release manages versioning and changelog updates based on merged commits.
- Never run `semantic-release` locally for production; allow CI to publish official releases.

## Community Standards
- Follow the project Code of Conduct (pending). Be respectful and constructive.
- Report security vulnerabilities privately as described in `SECURITY.md`.
