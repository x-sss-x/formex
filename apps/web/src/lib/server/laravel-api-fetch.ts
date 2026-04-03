import "server-only";

import { getStatefulHeadersForLaravel } from "@/lib/api/laravel-stateful-headers";

const backendBase = (): string =>
  (process.env.LARAVEL_BACKEND_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );

/**
 * Server-side GET to Laravel that returns the same shape TanStack Query caches from `$api`
 * (`{ data, status, headers }`).
 */
export async function laravelGetForQueryCache(
  apiPath: string,
  cookieHeader: string,
  incomingHeaders: Headers,
  signal?: AbortSignal,
): Promise<{ data: unknown; status: number; headers: Headers }> {
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  const res = await fetch(`${backendBase()}${path}`, {
    method: "GET",
    cache: "no-store",
    signal,
    headers: getStatefulHeadersForLaravel(cookieHeader, {
      headers: incomingHeaders,
    }),
  });

  let data: unknown;
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const text = await res.text();
    data = text ? JSON.parse(text) : undefined;
  } else {
    await res.text();
    data = undefined;
  }

  return {
    data,
    status: res.status,
    headers: res.headers,
  };
}
