import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import * as schema from "@/server/db/auth-schema";

export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "development"
      ? process.env.BETTER_AUTH_URL
      : `https://${process.env.VERCEL_URL}`,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});
