"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useProgramOutcomesIndex } from "@/lib/api/generated/program-outcome/program-outcome";

export function useProgramOutcomesList() {
  const queryClient = useQueryClient();
  const { data, ...programOutcomesQuery } = useProgramOutcomesIndex(
    {
      query: {
        select(data) {
          return data.status === 200 ? data.data.data : null;
        },
      },
    },
    queryClient,
  );

  return {
    programOutcomes: data,
    programOutcomesQuery,
  };
}
