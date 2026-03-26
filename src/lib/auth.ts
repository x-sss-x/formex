import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/server/db";
import * as schema from "@/server/db/auth-schema";
import { getBaseURL } from "@/utils/getBaseUrl";
import { ac, principal, program_head, staff } from "./permissions";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["*.vercel.app", "localhost:*"],
    fallback: getBaseURL(),
  },
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({
      ac,
      roles: {
        principal,
        program_head,
        staff,
      },
      adminRoles: ["principal"],
      defaultRole: "staff",
    }),
  ],
});
