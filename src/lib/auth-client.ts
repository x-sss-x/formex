import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, principal, programHead, staff } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        principal,
        programHead,
        staff,
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
