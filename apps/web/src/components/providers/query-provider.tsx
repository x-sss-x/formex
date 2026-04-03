"use client";

import {
  type DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

type QueryProviderProps = {
  children: ReactNode;
  /** Server-prefetched TanStack cache from `dehydrateAppQueries()` (root layout). */
  dehydratedState?: DehydratedState;
};

export function QueryProvider({
  children,
  dehydratedState,
}: QueryProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {dehydratedState ? (
        <HydrationBoundary state={dehydratedState}>
          {children}
        </HydrationBoundary>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
