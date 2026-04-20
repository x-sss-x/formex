"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCoursePlansIndex } from "@/lib/api/generated/course-plan/course-plan";

export function useCoursePlansList() {
  const queryClient = useQueryClient();
  const { data, ...coursePlansQuery } = useCoursePlansIndex(
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
    coursePlans: data,
    coursePlansQuery,
  };
}
