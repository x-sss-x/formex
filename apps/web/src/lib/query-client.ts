
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min (important for hydration)
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
      },
    },
  });