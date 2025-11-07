# Rugged Weave

Hybrid raw-denim marketplace delivering precision fit matching, verified fade authenticity, and a circular resale loop for Indonesia-first growth.

## Table of Contents
1. [Overview](#overview)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Quickstart](#quickstart)
5. [Configuration](#configuration)
6. [Development Workflow](#development-workflow)
7. [Testing & Quality](#testing--quality)
8. [Release Process](#release-process)
9. [Security & Compliance](#security--compliance)
10. [Documentation & Support](#documentation--support)
11. [Contributing](#contributing)
12. [License](#license)

## Overview
Rugged Weave is built from the Better T Stack—React 18, TanStack Router, Hono, tRPC, Drizzle ORM, and Turso—augmented with AI-driven fade verification and marketplace workflows described in `PLAN.md`.

Key MVP capabilities:
- Passwordless onboarding with measurement-rich buyer profiles for fit matching.
- Listing lifecycle with media authenticity checks, fade scoring, and moderation.
- Escrowed checkout via Xendit, shipping orchestration, notifications, and partner tooling.

## Architecture Overview
- **Edge API**: Cloudflare Workers running Hono+tRPC services, Durable Objects for coordination, and Cloudflare Queues for async workloads.
- **Frontend**: React web app with TanStack Router, React Query, Tailwind, shadcn/ui, and offline-ready PWA shell.
- **AI Fade Intelligence**: External FastAPI service performing OpenCV/CLIP-based fade scoring with signed media URLs.
- **Data Layer**: Turso (LibSQL) managed with Drizzle ORM migrations; KV for feature flags; R2 for media storage.
- **Observability**: Logpush exports, structured logging, tracing headers, and Sentry integration (per plan).

## Project Structure
```
rugged-weave/
├── apps/
│   ├── web/         # React frontend
│   ├── docs/        # Astro Starlight documentation site
│   └── server/      # Cloudflare Worker API
├── packages/
│   ├── api/         # Shared tRPC routers and service modules
│   ├── auth/        # better-auth configuration
│   └── db/          # Drizzle schema and migrations
├── docs/            # Research notes and future guides
└── PLAN.md          # Business, product, and technical plan
```

## Quickstart
1. **Install dependencies**
   ```bash
   bun install
   ```
2. **Bootstrap environment files**
   - Copy `.env.example` files (when available) inside `apps/web`, `apps/server`, and relevant packages.
   - Provide required keys (see [Configuration](#configuration)).
3. **Run the full stack**
   ```bash
   bun run dev
   ```
   - Web app: http://localhost:3001
   - API worker: http://localhost:3000

## Configuration
Follow Twelve-Factor principles: store secrets in environment variables and keep staging/production parity.

### Common variables
- `DATABASE_URL` – Turso LibSQL connection string.
- `BETTER_AUTH_SECRET` – Server secret for better-auth session signing.
- `XENDIT_API_KEY` / `XENDIT_SECRET_KEY` – Payments API credentials.
- `KOMSHIP_API_KEY` / `SHIPPER_API_KEY` – Shipping integrations.
- `SENTRY_DSN` – Observability instrumentation.

### App-specific notes
- `apps/web/.env`
  - `VITE_SERVER_URL` – Base URL for the server tRPC proxy.
  - `VITE_SENTRY_DSN` – Client error logging.
- `apps/server/.env`
  - `CORS_ORIGIN` – Allowed frontend origins.
  - `BETTER_AUTH_URL` – Public server URL used in auth callbacks.
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – OAuth credentials for Google sign-in.
  - `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` – Sign in with Apple credentials (optionally add `APPLE_APP_BUNDLE_IDENTIFIER` for native flows).
  - `AUTH_OTP_WEBHOOK_URL` / `AUTH_OTP_WEBHOOK_TOKEN` – Optional webhook target for delivering one-time passcodes.
  - `AUTH_DEBUG_SHOW_OTP` – Set to `true` locally to log OTP codes when no transport is configured.
  - `AUTH_TRUSTED_ORIGINS` – Comma-separated additional origins allowed to hit auth endpoints.
  - `AUTH_COOKIE_DOMAIN` – Enables cross-subdomain cookies when hosting across workers.dev and custom domains.
  - `AUTH_TELEMETRY_WEBHOOK_URL` / `AUTH_TELEMETRY_WEBHOOK_TOKEN` – Optional destination for auth telemetry events.
  - `AUTH_TELEMETRY_ENABLED` / `AUTH_TELEMETRY_DEBUG` – Toggle Better Auth telemetry collection and local logging.
  - `FADE_INTEL_ENDPOINT` – FastAPI scoring service endpoint.
- `packages/db/.env`
  - `DATABASE_URL` and `DATABASE_AUTH_TOKEN` for Drizzle migrations.

## Development Workflow
- **Scoped dev servers**: `bun run dev:web`, `bun run dev:server`, `bun run dev:docs`.
- **Database tasks**: `bun run db:generate`, `bun run db:push`, `bun run db:migrate` via Turbo filters.
- **Code quality**: Husky runs lint-staged; run `bun run check` for Biome formatting and linting.
- **Type safety**: `bun run check-types` ensures project-wide TypeScript health.

## Testing & Quality
- Write tests alongside features per scenarios listed in `PLAN.md` (unit, integration, E2E).
- Execute package-level tests using Turbo filters once suites are implemented.
- Capture before/after evidence for UI changes and attach to PRs.
- Monitor KPI alignment (e.g., profile completion, fit search P95) as metrics are implemented.

## Release Process
- Commits must follow Conventional Commits; commitlint enforces the format.
- `semantic-release` analyzes commits on `main` to compute the next SemVer, update `CHANGELOG.md`, and create GitHub releases.
- Keep `CHANGELOG.md` updated under the **Unreleased** section; automation will promote entries during release.

## Security & Compliance
- Follow the security checklist in `SECURITY.md` mapped to OWASP Top 10 2021 and 2025 RC updates.
- Use HMAC verification for external webhooks, encrypt PII, and log security events with request IDs.
- Document mitigation steps for new risks in PR descriptions and the changelog.

## Documentation & Support
- Research summaries live in `docs/research/` and inform our standards.
- Update the Astro docs site (`apps/docs`) with user-facing guides as features stabilize.
- Support channels: `support@ruggedweave.example.com` (buyers/sellers), `partners@ruggedweave.example.com` (brands), `security@ruggedweave.example.com` (vulnerabilities).

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, code review expectations, testing requirements, and release workflow.

## License
[MIT](LICENSE)
