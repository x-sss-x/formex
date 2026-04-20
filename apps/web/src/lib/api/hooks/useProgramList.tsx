"use client";

import { useProgramsIndex } from "@/lib/api/generated/program/program";
import { useQueryClient } from "@tanstack/react-query";

export function useProgramList(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const { data, ...programQuery } = useProgramsIndex(
    {
      query: {
        enabled,
        select(data) {
          return data.status == 200 ? data.data.data : null;
        },
      },
    },
    queryClient,
  );

  return {
    programs: data,
    programQuery,
  };
}
