# Authentication Research

## Better Auth configuration
- The Better Auth options reference clarifies how to tune session lifetimes (`expiresIn`, `updateAge`) and cookie caching to support rotation-friendly JWT session management while storing session records in the database when needed.【https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/reference/options.mdx】
- The same reference documents built-in rate limiting knobs (`enabled`, `window`, `max`, `customRules`, `storage`) that map to our abuse prevention requirements for OTP endpoints.【https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/reference/options.mdx】
- Telemetry can be toggled per Better Auth’s telemetry guide, which highlights the optional and anonymized nature of the signals we forward to observability tooling.【https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/reference/telemetry.mdx】

## Email OTP plugin
- Better Auth’s email OTP plugin adds send/check/verify flows plus automatic user creation for unknown emails, covering our passwordless onboarding use case while allowing strict attempt limits and hashed OTP storage for security hardening.【https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/plugins/email-otp.mdx】

## Social providers
- Google’s provider guide details the `socialProviders.google` configuration using client ID/secret pairs and `signIn.social` usage, aligning with our OAuth/OIDC login requirement.【https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/authentication/google.mdx】
- Apple’s provider documentation calls for adding `appleid.apple.com` to trusted origins and optionally supplying the native bundle identifier when handling ID tokens, which we enforce when wiring Sign in with Apple.【https://raw.githubusercontent.com/better-auth/better-auth/main/docs/content/docs/authentication/apple.mdx】
