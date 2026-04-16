"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import Container from "@/components/container";
import Header from "@/components/header";
import { SpinnerPage } from "@/components/spinner-page";
import { TimetableTable } from "@/components/timetable/TimetableTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSubjectListbysemester } from "@/lib/api/generated/subject/subject";
import { useProgramsShow } from "@/lib/api/hooks/useProgramsShow";
import {
  useProgramTimetable,
  useSaveProgramTimetableSlot,
} from "@/lib/api/hooks/useTimetable";
import { DAYS, useTimetableStore } from "./useTimetableStore";

function clampSemester(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 1;
  }

  return Math.min(6, Math.max(1, n));
}

type AssignedStaffItem = {
  id: string;
  name: string;
};

function isAssignedStaffItem(value: unknown): value is AssignedStaffItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const maybeRecord = value as Record<string, unknown>;
  return (
    typeof maybeRecord.id === "string" && typeof maybeRecord.name === "string"
  );
}

function toAssignedStaff(value: unknown): AssignedStaffItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((staff) => (isAssignedStaffItem(staff) ? [staff] : []));
}

export function TimetablePage() {
  const { programId } = useParams<{ programId: string }>();
  const numericProgramId = Number(programId);
  const searchParams = useSearchParams();
  const semester = clampSemester(searchParams.get("semester"));
  const { data: program } = useProgramsShow(programId);
  const setSubjectOptions = useTimetableStore(
    (state) => state.setSubjectOptions,
  );
  const hydrateSlots = useTimetableStore((state) => state.hydrateSlots);

  const subjectsQuery = useSubjectListbysemester(numericProgramId, semester, {
    query: { enabled: Number.isFinite(numericProgramId) && Boolean(programId) },
  });

  const subjectOptions = useMemo(() => {
    if (subjectsQuery.data?.status !== 200) {
      return [];
    }

    return subjectsQuery.data.data.data.map((subject) => ({
      id: subject.id,
      name: subject.name,
      coordinators: toAssignedStaff(subject.assigned_staff).map((staff) => ({
        id: staff.id,
        name: staff.name,
      })),
    }));
  }, [subjectsQuery.data]);

  useEffect(() => {
    setSubjectOptions(subjectOptions);
  }, [setSubjectOptions, subjectOptions]);

  const timetableQuery = useProgramTimetable(programId ?? "", semester);

  useEffect(() => {
    if (!timetableQuery.data) {
      return;
    }

    const slots = timetableQuery.data.slots
      .filter((slot) => DAYS.includes(slot.day as (typeof DAYS)[number]))
      .map((slot) => ({
        day: slot.day as (typeof DAYS)[number],
        startHour: slot.start_hour_no,
        endHour: slot.end_hour_no,
        subjects: slot.subjects.map((entry) => ({
          subjectId: entry.subject_id,
          subjectName: entry.subject_name,
          coordinatorId: entry.course_coordinator_id,
          coordinatorName: entry.course_coordinator_name,
          roomNumber: entry.room_no,
          batchNumber: entry.batch,
        })),
      }));

    hydrateSlots(slots);
  }, [hydrateSlots, timetableQuery.data]);

  const saveSlotMutation = useSaveProgramTimetableSlot(programId ?? "", semester);

  const isLoading = subjectsQuery.isLoading || timetableQuery.isLoading;
  const hasError = subjectsQuery.isError || timetableQuery.isError;

  return (
    <>
      <Header>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {programId ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/p/${programId}`}>
                      {program?.name ?? "Program"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Timetable</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Header>

      <Container className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Timetable</h1>
          <p className="text-muted-foreground text-sm">
            Manage slot assignments for each day and hour.
          </p>
        </div>
        {isLoading ? (
          <SpinnerPage />
        ) : hasError ? (
          <p className="text-sm text-destructive">
            Could not load timetable data. Please refresh.
          </p>
        ) : (
          <TimetableTable
            subjectOptions={subjectOptions}
            onSaveSlot={saveSlotMutation.mutateAsync}
            isSavingSlot={saveSlotMutation.isPending}
          />
        )}
      </Container>
    </>
  );
}
