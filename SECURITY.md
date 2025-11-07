# Security Policy

## Reporting a Vulnerability
- Email `security@ruggedweave.example.com` with a clear description, reproduction steps, and impact.
- Do not disclose publicly until we acknowledge and provide mitigation guidance.
- We aim to acknowledge reports within 48 hours and provide status updates every 5 business days.

## Supported Branches
- `main`: actively patched and monitored by the core team.

## Secure Development Checklist
Aligned with [OWASP Top 10 2021](https://owasp.org/Top10/) and highlights from the [2025 RC](https://owasp.org/Top10/):
- **Access Control & Authentication**: Enforce RBAC, MFA/OTP, session rotation, and revocation tooling.
- **Cryptography & Data Protection**: Use TLS everywhere, encrypt PII at rest, rotate secrets, and avoid custom crypto.
- **Injection & Input Validation**: Validate inputs with Zod, parameterize queries with Drizzle, and sanitize logs.
- **Insecure Design & Misconfiguration**: Document threat models, enable least privilege defaults, and store config in environment variables per Twelve-Factor guidance.
- **Software Supply Chain**: Track dependency provenance, pin versions, and monitor advisories.
- **Integrity & Logging**: Sign webhooks with HMAC, emit structured logs, and monitor for anomalies.
- **Exceptional Conditions**: Handle rate limiting, error responses, and fallback flows to avoid denial-of-service amplification.

## Authentication Controls
- Email OTP authentication hashes stored codes, enforces three-attempt limits per minute, and emits telemetry for dispatch failures so suspicious retries are visible to responders.
- Session tokens rotate every 12 hours, expire after seven days, and are persisted in the database to enable administrative revocation.
- OAuth/OIDC callbacks require trusted origins; Sign in with Apple explicitly allow-lists `https://appleid.apple.com` alongside marketplace frontends.

## Additional Guidance
- Rotate secrets via platform-specific secret managers; never commit credentials.
- Review new features against the security checklist during PR review and note mitigations in the changelog where appropriate.
