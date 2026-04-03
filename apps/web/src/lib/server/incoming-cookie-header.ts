import "server-only";

import { cookies, headers } from "next/headers";

/**
 * Cookie header string for outbound API calls that must mirror the browser session.
 */
export async function getIncomingCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  const fromStore = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const hdrs = await headers();

  return hdrs.get("cookie") ?? fromStore;
}
