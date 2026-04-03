import "server-only";

import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from "@tanstack/react-query";
import type { authUserResponse } from "@/lib/api/generated/auth/auth";
import { getAuthUserQueryKey } from "@/lib/api/generated/auth/auth";
import type { programsIndexResponse } from "@/lib/api/generated/context-program/context-program";
import { getProgramsIndexQueryKey } from "@/lib/api/generated/context-program/context-program";
import { laravelGetForQueryCache } from "./laravel-api-fetch";

const STALE_MS = 60_000;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_MS,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/**
 * Prefetch session auth + programs (when an institution is active) using the same
 * `queryKey`s as Orval’s `useAuthUserSuspense` / `useProgramsIndexSuspense`.
 */
export async function dehydrateAppQueries(
  cookieHeader: string,
  nextHeaders: Headers,
): Promise<DehydratedState> {
  const client = createQueryClient();

  await client.prefetchQuery({
    queryKey: getAuthUserQueryKey(),
    staleTime: STALE_MS,
    queryFn: ({ signal }) =>
      laravelGetForQueryCache(
        "/api/user",
        cookieHeader,
        nextHeaders,
        signal,
      ).then(
        (r) =>
          ({
            data: r.data,
            status: r.status,
            headers: r.headers,
          }) as authUserResponse,
      ),
  });

  const auth = client.getQueryData(getAuthUserQueryKey()) as
    | authUserResponse
    | undefined;

  if (auth?.status === 200 && auth.data.current_institution_id) {
    const id = auth.data.current_institution_id;
    await client.prefetchQuery({
      queryKey: [...getProgramsIndexQueryKey(), id],
      staleTime: STALE_MS,
      queryFn: ({ signal }) =>
        laravelGetForQueryCache(
          "/api/programs",
          cookieHeader,
          nextHeaders,
          signal,
        ).then(
          (r) =>
            ({
              data: r.data,
              status: r.status,
              headers: r.headers,
            }) as programsIndexResponse,
        ),
    });
  }

  return dehydrate(client);
}
