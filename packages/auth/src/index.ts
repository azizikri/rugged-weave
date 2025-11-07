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

const authSchema = {
  account,
  session,
  user,
  verification,
} as const;

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "sqlite",

    schema: authSchema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    crossSubDomainCookies: {
      enabled: true,
      domain: "azizikri.workers.dev",
    },
  },
});
