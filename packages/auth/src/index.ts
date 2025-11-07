import { env } from "cloudflare:workers";
import { db } from "@rugged-weave/db";
import {
  account,
  session,
  user,
  verification,
} from "@rugged-weave/db/schema/auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";

const authSchema = {
  account,
  session,
  user,
  verification,
} as const;

type SocialProviders = NonNullable<BetterAuthOptions["socialProviders"]>;
type OtpType = "sign-in" | "email-verification" | "forget-password";

type TelemetryPayload = Record<string, unknown>;

type OtpDispatchPayload = {
  email: string;
  otp: string;
  type: OtpType;
};

const textEncoder = new TextEncoder();
const NAME_DELIMITER = /[._-]+/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function deriveDisplayName(email: string, providedName?: string | null) {
  if (providedName && providedName.trim().length > 0) {
    return providedName.trim();
  }

  const [localPart] = email.split("@");
  if (!localPart) {
    return "";
  }

  return localPart
    .split(NAME_DELIMITER)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function extractRequestMetadata(request?: Request | null) {
  if (!request) {
    return {} as TelemetryPayload;
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  return {
    ...(ip ? { ip } : {}),
    ...(userAgent ? { userAgent } : {}),
  } satisfies TelemetryPayload;
}

async function hashIdentifier(value?: string | null) {
  if (!value) {
    return null;
  }
  const data = textEncoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function publishTelemetry(event: string, payload: TelemetryPayload = {}) {
  try {
    const body = JSON.stringify({
      event,
      payload,
      timestamp: new Date().toISOString(),
    });

    if (env.AUTH_TELEMETRY_WEBHOOK_URL) {
      await fetch(env.AUTH_TELEMETRY_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(env.AUTH_TELEMETRY_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${env.AUTH_TELEMETRY_WEBHOOK_TOKEN}` }
            : {}),
        },
        body,
      });
      return;
    }

    if (env.AUTH_TELEMETRY_DEBUG === "true") {
      console.info(`[auth.telemetry] ${event}`, payload);
    }
  } catch (error) {
    console.warn(`[auth.telemetry] failed to emit ${event}`, error);
  }
}

async function sendOtpThroughChannel(payload: OtpDispatchPayload) {
  if (env.AUTH_OTP_WEBHOOK_URL) {
    await fetch(env.AUTH_OTP_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.AUTH_OTP_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${env.AUTH_OTP_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    return;
  }

  if (env.AUTH_DEBUG_SHOW_OTP === "true" || env.NODE_ENV !== "production") {
    console.info(
      `[auth.debug] OTP for ${payload.email} (${payload.type}): ${payload.otp}`
    );
    return;
  }

  throw new Error("OTP transport is not configured");
}

async function handleOtpDispatch(data: OtpDispatchPayload, request?: Request) {
  const normalizedEmail = normalizeEmail(data.email);
  const emailHash = await hashIdentifier(normalizedEmail);
  const metadata = extractRequestMetadata(request);

  await publishTelemetry("auth.otp.requested", {
    emailHash,
    type: data.type,
    ...metadata,
  });

  try {
    await sendOtpThroughChannel({
      ...data,
      email: normalizedEmail,
    });

    await publishTelemetry("auth.otp.dispatched", {
      emailHash,
      type: data.type,
      ...metadata,
    });
  } catch (error) {
    await publishTelemetry("auth.otp.dispatch_failed", {
      emailHash,
      type: data.type,
      reason: error instanceof Error ? error.message : "unknown",
      ...metadata,
    });
    throw error;
  }
}

function buildSocialProviders() {
  const providers: SocialProviders = {};

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
    providers.apple = {
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET,
      ...(env.APPLE_APP_BUNDLE_IDENTIFIER
        ? { appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER }
        : {}),
    };
  }

  return providers;
}

const additionalOrigins = env.AUTH_TRUSTED_ORIGINS
  ? env.AUTH_TRUSTED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

const socialProviders = buildSocialProviders();
const hasSocialProviders = Object.keys(socialProviders).length > 0;

const trustedOrigins = new Set<string>();
if (env.CORS_ORIGIN) {
  trustedOrigins.add(env.CORS_ORIGIN);
}
for (const origin of additionalOrigins) {
  trustedOrigins.add(origin);
}
if ("apple" in socialProviders) {
  trustedOrigins.add("https://appleid.apple.com");
}

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: Array.from(trustedOrigins),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 12,
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 120,
    customRules: {
      "/email-otp/send-verification-otp": { window: 60, max: 3 },
      "/email-otp/check-verification-otp": { window: 60, max: 3 },
      "/sign-in/email-otp": { window: 60, max: 3 },
    },
  },
  socialProviders: hasSocialProviders ? socialProviders : undefined,
  plugins: [
    emailOTP({
      allowedAttempts: 3,
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }, request) {
        await handleOtpDispatch({ email, otp, type }, request);
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (draft) => ({
          data: {
            ...draft,
            email: normalizeEmail(draft.email),
            name: deriveDisplayName(normalizeEmail(draft.email), draft.name),
          },
        }),
        after: async (created, context) => {
          await publishTelemetry("auth.user.created", {
            userId: created.id,
            emailHash: await hashIdentifier(created.email),
            ...extractRequestMetadata(context?.request ?? null),
          });
        },
      },
    },
    session: {
      create: {
        after: async (created, context) => {
          await publishTelemetry("auth.session.created", {
            userId: created.userId,
            sessionId: created.id,
            tokenHash: await hashIdentifier(created.token),
            expiresAt: created.expiresAt?.toISOString?.() ?? null,
            ...extractRequestMetadata(context?.request ?? null),
          });
        },
      },
      update: {
        after: async (updated, context) => {
          await publishTelemetry("auth.session.updated", {
            userId: updated.userId,
            sessionId: updated.id,
            tokenHash: await hashIdentifier(updated.token),
            expiresAt: updated.expiresAt?.toISOString?.() ?? null,
            ...extractRequestMetadata(context?.request ?? null),
          });
        },
      },
      delete: {
        after: async (deleted, context) => {
          await publishTelemetry("auth.session.deleted", {
            userId: deleted.userId,
            sessionId: deleted.id,
            tokenHash: await hashIdentifier(deleted.token),
            ...extractRequestMetadata(context?.request ?? null),
          });
        },
      },
    },
  },
  telemetry: {
    enabled: env.AUTH_TELEMETRY_ENABLED === "true",
    debug: env.AUTH_TELEMETRY_DEBUG === "true",
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    ...(env.AUTH_COOKIE_DOMAIN
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: env.AUTH_COOKIE_DOMAIN,
          },
        }
      : {}),
  },
});
