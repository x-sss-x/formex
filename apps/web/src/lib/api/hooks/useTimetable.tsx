"use client";

import { useMutation, useQueries } from "@tanstack/react-query";
import { ensureSanctumCsrf } from "@/lib/api/csrf";
import type { TimetableUpsertSlotBody } from "@/lib/api/generated/models";
import {
  timetableShow,
  timetableUpsertSlot,
  type timetableShowResponse,
  useTimetablePersonal,
  useTimetableShow,
} from "@/lib/api/generated/timetable/timetable";

type TimetableShowSuccess = Extract<timetableShowResponse, { status: 200 }>;
export type ProgramTimetableData = TimetableShowSuccess["data"]["data"];

export type ProgramTimetableSlotInput = {
  day: string;
  startHour: number;
  endHour: number;
  subjects: Array<{
    subjectId: string;
    coordinatorId: string;
    roomNumber: string;
    batchNumber: string;
  }>;
};

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return fallback;
}

function normalizeProgramId(programId: string): string {
  const trimmed = programId.trim();
  if (!trimmed || trimmed === "NaN") {
    return "";
  }

  return trimmed;
}

export function useProgramTimetable(programId: string, semester: number) {
  const safeProgramId = normalizeProgramId(programId);
  const { data, ...query } = useTimetableShow(
    safeProgramId,
    { semester },
    {
      query: {
        enabled: Boolean(safeProgramId),
        select: (response): ProgramTimetableData => {
          if (response.status !== 200) {
            throw new Error(
              getErrorMessage(response.data, "Could not load timetable."),
            );
          }

          return response.data.data;
        },
      },
    },
  );

  return {
    data: data ?? null,
    ...query,
  };
}

export function useProgramMasterTimetable(
  programId: string,
  semesters: readonly number[],
  enabled: boolean,
) {
  const safeProgramId = normalizeProgramId(programId);
  return useQueries({
    queries: semesters.map((semester) => ({
      queryKey: ["program-master-timetable", safeProgramId, semester],
      queryFn: async (): Promise<ProgramTimetableData> => {
        const response = await timetableShow(safeProgramId, { semester });

        if (response.status !== 200) {
          throw new Error(
            getErrorMessage(response.data, "Could not load timetable."),
          );
        }

        return response.data.data;
      },
      enabled: enabled && Boolean(safeProgramId),
    })),
  });
}

export function useSaveProgramTimetableSlot(
  programId: string,
  semester: number,
) {
  const safeProgramId = normalizeProgramId(programId);
  return useMutation({
    mutationFn: async (data: ProgramTimetableSlotInput) => {
      if (!safeProgramId) {
        throw new Error("Program is required.");
      }

      await ensureSanctumCsrf();

      const payload: TimetableUpsertSlotBody = {
        semester,
        day: data.day,
        start_hour_no: data.startHour,
        end_hour_no: data.endHour,
        subjects: data.subjects.map((entry) => ({
          subject_id: entry.subjectId,
          course_coordinator_id: entry.coordinatorId,
          batch: entry.batchNumber,
          room_no: entry.roomNumber,
        })),
      };

      const saveResponse = await timetableUpsertSlot(safeProgramId, payload);

      if (saveResponse.status !== 200) {
        throw new Error(
          getErrorMessage(saveResponse.data, "Could not save timetable slot."),
        );
      }
    },
  });
}

export type PersonalTimetableRow = {
  sl_no: number;
  program_name: string;
  semester: number;
  course_name: string;
  no_of_students: number;
  room_no: string;
  day_slots: Record<string, Record<string, boolean>>;
};

export type PersonalTimetableData = {
  academic_year: number;
  days: string[];
  rows: PersonalTimetableRow[];
};

export function usePersonalTimetable() {
  const { data, ...query } = useTimetablePersonal({
    query: {
      select: (response): PersonalTimetableData => {
        if (response.status !== 200) {
          throw new Error(
            getErrorMessage(
              response.data,
              "Could not load personal timetable.",
            ),
          );
        }

        return response.data.data as PersonalTimetableData;
      },
    },
  });

  return {
    data: data ?? null,
    ...query,
  };
}
