# Key Decisions

## 2025-02-14
- Adopted Google engineering code review standards to guide PR expectations and reviewer responsibilities.
- Standardized commit messages with Conventional Commits and semantic-release to automate versioning and changelog generation.
- Documented governance artifacts (CODEOWNERS, CONTRIBUTING, SECURITY) to align with Google review philosophy and OWASP guidance.

## 2025-02-15
- Implemented Better Auth email OTP as the default passwordless path with hashed storage and built-in rate limiting, keeping password flows as an optional fallback for power sellers and admins.
- Enabled Google and Apple OIDC logins with explicit trusted-origin whitelisting, plus telemetry hooks for OTP dispatch/session lifecycle to support moderation and fraud monitoring.
