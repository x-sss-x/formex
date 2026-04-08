"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  useHigherEducationListByProgram,
  useHigherEducationListByStudent,
  useHigherEducationsIndex,
  useHigherEducationsShow,
} from "@/lib/api/generated/higher-education/higher-education";

export function useHigherEducationsList(enabled = true) {
  const queryClient = useQueryClient();
  const { data, ...higherEducationsQuery } = useHigherEducationsIndex(
    {
      query: {
        enabled,
        select(data) {
          return data.status === 200 ? data.data.data : [];
        },
      },
    },
    queryClient,
  );

  return {
    higherEducations: data ?? [],
    higherEducationsQuery,
  };
}

export function useHigherEducation(higherEducationId: number) {
  const queryClient = useQueryClient();
  const { data, ...higherEducationQuery } = useHigherEducationsShow(
    higherEducationId,
    {
      query: {
        enabled: !!higherEducationId,
        select(data) {
          return data.status === 200 ? data.data.data : null;
        },
      },
    },
    queryClient,
  );

  return {
    higherEducation: data,
    higherEducationQuery,
  };
}

export function useHigherEducationsByProgram(programId: string, enabled = true) {
  const queryClient = useQueryClient();
  const { data, ...higherEducationsQuery } = useHigherEducationListByProgram(
    programId,
    {
      query: {
        enabled: enabled && !!programId,
        select(data) {
          return data.status === 200 ? data.data.data : [];
        },
      },
    },
    queryClient,
  );

  return {
    higherEducations: data ?? [],
    higherEducationsQuery,
  };
}

export function useHigherEducationsByStudent(studentId: string, enabled = true) {
  const queryClient = useQueryClient();
  const { data, ...higherEducationsQuery } = useHigherEducationListByStudent(
    studentId,
    {
      query: {
        enabled: enabled && !!studentId,
        select(data) {
          return data.status === 200 ? data.data.data : [];
        },
      },
    },
    queryClient,
  );

  return {
    higherEducations: data ?? [],
    higherEducationsQuery,
  };
}
