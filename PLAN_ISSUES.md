# Plan Issue Checklist

This document translates the plan in `PLAN.md` into GitHub-style issues with acceptance criteria for tracking.

## Governance & Enablement
- [ ] **Issue: Bootstrap project standards and governance**
  - Acceptance Criteria:
    - Repository includes CODEOWNERS, CONTRIBUTING, SECURITY, LICENSE, DECISIONS, and CHANGELOG files aligned with referenced best practices.
    - Commit linting enforces Conventional Commits and semantic-release automation is configured.
    - Research notes for review, changelog, documentation, security, and architecture are published under `docs/research/`.
    - README outlines project purpose, setup, architecture, configuration, testing, release, and support guidance.

- [ ] **Issue: Create task breakdown and tracking artifacts**
  - Acceptance Criteria:
    - `task_breakdown.md` maps each issue to a branch and planned PR.
    - GitHub issue checklist is current and synced with plan priorities.

## MVP Feature Pillars
- [ ] **Issue: Registration & Authentication**
  - Acceptance Criteria:
    - Implement better-auth passwordless with optional password fallback and Google/Apple OIDC login.
    - JWT sessions issued with rotation and secure storage policies documented.
    - OTP flows validated with rate limiting and telemetry hooks.

- [ ] **Issue: Profiles & Measurements**
  - Acceptance Criteria:
    - Data model captures required body measurements with unit toggles and privacy controls.
    - UI allows buyers to enter/update measurements with validation and helps power fit matching.
    - Profile completion analytics available to support KPI tracking.

- [ ] **Issue: Listings & Media Quality**
  - Acceptance Criteria:
    - Listing CRUD supports measurement fields, condition, soak/wash history, price, and media attachments.
    - Duplicate photo detection integrated with moderation signals.
    - Draft/publish/archive lifecycle with audit history implemented.

- [ ] **Issue: Search & Fit Match**
  - Acceptance Criteria:
    - Search filters cover brand, size, condition, fade score, and price.
    - Ranking algorithm combines body vector similarity with configurable weights and deterministic ordering.
    - Performance meets P95 < 300 ms on representative workloads.

- [ ] **Issue: Fade Intelligence Service**
  - Acceptance Criteria:
    - Media pipeline uploads to R2 and submits to AI service, returning contrast/whiskers/honeycombs/stacks scores.
    - Manual override workflow records auditor identity and reason.
    - Turnaround time <= 30 seconds demonstrated in staging tests.

- [ ] **Issue: Payments & Escrow**
  - Acceptance Criteria:
    - Xendit hosted checkout integrates with escrow ledger tables and idempotent webhook handling.
    - Payout released after delivery + 72h dispute window with dispute overrides logged.
    - On-time payout metrics exposed to operations dashboard.

- [ ] **Issue: Shipping Integrations**
  - Acceptance Criteria:
    - Komship/Shipper rate shopping, label purchase, and tracking webhooks wired into order lifecycle.
    - Address normalization and buyer address book implemented.
    - Shipping events feed notifications and dispute triggers.

- [ ] **Issue: Orders & Disputes**
  - Acceptance Criteria:
    - State machine covers buy now, fulfillment, cancellation, dispute, and resolution states.
    - Idempotent actions with Durable Object or equivalent concurrency control for per-order operations.
    - Moderator tools can review and resolve disputes with audit trail.

- [ ] **Issue: Community Fade Journals**
  - Acceptance Criteria:
    - Journal entries support text, media, reactions, and comments per TDD schema.
    - Profanity filter and report-to-moderation hooks implemented.
    - E2E tests validate create/read flows and abuse reporting.

- [ ] **Issue: Moderation & Trust/Safety**
  - Acceptance Criteria:
    - Reporting queue with prioritization by signals (pHash matches, dispute rate, etc.).
    - Actions produce strikes, appeals, and notifications with audit logging.
    - Dashboards expose monthly fake/abusive listing rate <0.5% KPI.

- [ ] **Issue: Partner Portal**
  - Acceptance Criteria:
    - CSV import validates SKU data and surfaces actionable errors.
    - Partners can view orders, stock status, and payout statements filtered by permissions.
    - JWT claims enforce partner scoping with role-based views.

- [ ] **Issue: Notifications & Communications**
  - Acceptance Criteria:
    - In-app notification feed and email delivery via provider with template versioning.
    - Preference center allows opt-out per notification kind.
    - Delivery metrics captured for observability dashboards.

## Cross-Cutting Concerns
- [ ] **Issue: Observability & Reliability**
  - Acceptance Criteria:
    - Structured logging with request IDs, distributed tracing headers, and metrics shipping.
    - Error budgets defined with alerting thresholds for API and async workers.
    - Disaster recovery runbooks cover Turso snapshots and R2 lifecycle policies.

- [ ] **Issue: Security & Compliance**
  - Acceptance Criteria:
    - OWASP Top 10 (2021) coverage documented along with 2025 RC deltas and remediation owners.
    - HMAC-secured webhooks, RBAC enforcement, PII encryption, and rate limiting configured.
    - Security.md describes vulnerability disclosure, secret handling, and threat checklist.

- [ ] **Issue: Release & Deployment**
  - Acceptance Criteria:
    - CI pipelines enforce lint, type checks, tests, and semantic-release versioning.
    - Change management process includes changelog updates, feature flags, and canary deployments via Wrangler previews.
    - Release notes published per Keep a Changelog and automation triggers environment deploys.

- [ ] **Issue: Documentation & Support**
  - Acceptance Criteria:
    - README, docs site, and support channels cover onboarding, configuration, architecture, and troubleshooting.
    - Docs reference measurement KPIs, security posture, and moderation playbooks.
    - Support workflow defined for community, partners, and disputes.
