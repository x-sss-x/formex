import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min (important for hydration)
        gcTime: 5 * 60_000,
        // Prevent “double requests” right after server hydration.
        // We still allow refetching via explicit calls / invalidations.
        refetchOnMount: false,
      },
    },
  });

  // `/user` drives many UI branches; keep it stable and only refresh when we
  // explicitly invalidate/set it after auth-affecting mutations.
  client.setQueryDefaults(["/user"], {
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return client;
};
