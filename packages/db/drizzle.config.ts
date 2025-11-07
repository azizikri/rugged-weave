import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

if (!process.env.CI) {
  dotenv.config({
    path: "../../apps/server/.env",
  });
}

const getRequiredEnvVar = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  // DOCS: https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: getRequiredEnvVar(
      process.env.CLOUDFLARE_ACCOUNT_ID,
      "CLOUDFLARE_ACCOUNT_ID"
    ),
    databaseId: getRequiredEnvVar(
      process.env.CLOUDFLARE_DATABASE_ID,
      "CLOUDFLARE_DATABASE_ID"
    ),
    token: getRequiredEnvVar(
      process.env.CLOUDFLARE_D1_TOKEN,
      "CLOUDFLARE_D1_TOKEN"
    ),
  },
});
