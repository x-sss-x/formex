"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  courseMonthlyAttendancesUpdate,
  getCourseMonthlyAttendanceListByCourseQueryKey,
} from "@/lib/api/generated/course-monthly-attendance/course-monthly-attendance";
import type { CourseMonthlyAttendance } from "@/lib/api/generated/models/courseMonthlyAttendance";
import type { Student } from "@/lib/api/generated/models/student";
import { useProgramsStudentsIndex } from "@/lib/api/generated/student/student";
import { cn } from "@/lib/utils";
import { MinAttendanceMinClassesHint } from "./min-attendance-min-classes-hint";

/** Same reference for “no data yet” so `useEffect` dependency arrays do not change every render. */
const STABLE_STUDENT_LIST: Student[] = [];

type Line = {
  studentId: string;
  fullName: string;
  registerNo: string | null;
  totalClassesAttended: number;
  remarks: string;
};

const monthName = (m: number) => format(new Date(2000, m - 1, 1), "MMMM");

function rowAttendancePercent(
  classesHeld: number,
  classesAttended: number,
): number {
  if (classesHeld <= 0) {
    return 0;
  }
  return Math.round((100 * 100 * classesAttended) / classesHeld) / 100;
}

export function EditMonthlyAttendanceSheet({
  programId,
  subjectId,
  initial,
  open,
  onOpenChange,
}: {
  programId: string;
  subjectId: string;
  initial: CourseMonthlyAttendance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [totalHeld, setTotalHeld] = useState(
    String(initial.total_classes_held),
  );
  const [minPercent, setMinPercent] = useState(
    String(initial.minimum_attendance_percent),
  );
  const [lines, setLines] = useState<Line[]>([]);
  const initialRef = useRef(initial);
  initialRef.current = initial;

  const studentsQ = useProgramsStudentsIndex(programId, {
    query: { enabled: open && !!programId },
  });
  const allStudents: Student[] = useMemo(() => {
    if (studentsQ.data?.status === 200) {
      return studentsQ.data.data.data;
    }
    return STABLE_STUDENT_LIST;
  }, [studentsQ.data]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const rec = initialRef.current;
    setTotalHeld(String(rec.total_classes_held));
    setMinPercent(String(rec.minimum_attendance_percent));
    const byId = new Map(
      (rec.attendance_students ?? []).map((a) => [
        a.student_id,
        {
          att: a.total_classes_attended,
          remarks: a.remarks ?? "",
          name: a.student?.full_name ?? a.student_id,
          reg: a.student?.register_no ?? null,
        },
      ]),
    );
    const merged: Line[] = (rec.attendance_students ?? []).map((a) => ({
      studentId: a.student_id,
      fullName: a.student?.full_name ?? a.student_id,
      registerNo: a.student?.register_no ?? null,
      totalClassesAttended: a.total_classes_attended,
      remarks: a.remarks ?? "",
    }));
    if (merged.length > 0) {
      setLines(merged);
      return;
    }
    const fromDirectory = allStudents
      .filter(
        (s) =>
          s.semester === (rec.course?.semester ?? 0) &&
          s.academic_year === rec.academic_year,
      )
      .map(
        (s): Line => ({
          studentId: s.id,
          fullName: s.full_name,
          registerNo: s.register_no ?? null,
          totalClassesAttended: byId.get(s.id)?.att ?? 0,
          remarks: byId.get(s.id)?.remarks ?? "",
        }),
      );
    setLines(fromDirectory);
  }, [open, allStudents]);

  const updateMutation = useMutation({
    mutationFn: async (body: {
      month: number;
      academic_year: number;
      total_classes_held: number;
      minimum_attendance_percent: number;
      students: {
        student_id: string;
        total_classes_attended: number;
        remarks: string | null;
      }[];
    }) => {
      return courseMonthlyAttendancesUpdate(initial.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: async (res) => {
      if (res.status >= 400) {
        const message =
          typeof (res.data as { message?: string })?.message === "string"
            ? (res.data as { message: string }).message
            : "Could not update";
        toast.error(message);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: getCourseMonthlyAttendanceListByCourseQueryKey(subjectId),
      });
      toast.success("Attendance updated");
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Could not update");
    },
  });

  function updateLine(
    i: number,
    patch: Partial<Pick<Line, "totalClassesAttended" | "remarks">>,
  ) {
    setLines((prev) => {
      const n = [...prev];
      const cur = n[i];
      if (cur) {
        n[i] = { ...cur, ...patch };
      }
      return n;
    });
  }

  function save() {
    const total = Number.parseInt(totalHeld, 10);
    const minP = Number.parseFloat(minPercent);
    if (!Number.isFinite(total) || total < 1) {
      toast.error("Invalid total classes held");
      return;
    }
    if (!Number.isFinite(minP) || minP < 0 || minP > 100) {
      toast.error("Invalid minimum %");
      return;
    }
    for (const line of lines) {
      if (line.totalClassesAttended < 0 || line.totalClassesAttended > total) {
        toast.error("Attended count must be between 0 and total classes held.");
        return;
      }
    }
    if (lines.length === 0) {
      toast.error("No student rows to save");
      return;
    }
    updateMutation.mutate({
      month: initial.month,
      academic_year: initial.academic_year,
      total_classes_held: total,
      minimum_attendance_percent: minP,
      students: lines.map((l) => ({
        student_id: l.studentId,
        total_classes_attended: l.totalClassesAttended,
        remarks: l.remarks.trim() ? l.remarks.trim() : null,
      })),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full max-w-full flex-col gap-0 overflow-hidden data-[side=right]:!max-w-[min(64rem,58vw)] data-[side=right]:sm:!max-w-[min(64rem,58vw)]">
        <SheetHeader>
          <SheetTitle>
            Edit: {monthName(initial.month)} {initial.academic_year}
          </SheetTitle>
          <SheetDescription>
            Month and year cannot be changed. Adjust totals, minimum %, and
            per-student values.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-4 sm:px-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Total classes held</Label>
              <Input
                type="number"
                min={1}
                value={totalHeld}
                onChange={(e) => {
                  setTotalHeld(e.target.value);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Minimum attendance %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={minPercent}
                onChange={(e) => {
                  setMinPercent(e.target.value);
                }}
              />
              <MinAttendanceMinClassesHint
                totalHeldStr={totalHeld}
                minPercentStr={minPercent}
              />
            </div>
          </div>

          <div className="max-h-[55vh] min-w-0 overflow-x-auto overflow-y-auto rounded-md border">
            <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-sm [tbody_tr:hover]:bg-muted/30">
              <thead>
                <tr className="bg-muted/50 text-left text-xs sm:text-sm">
                  <th className="w-[1%] min-w-[6.5rem] max-w-[11rem] px-3 py-2.5 font-medium">
                    Student
                  </th>
                  <th className="w-[1%] min-w-[9.5rem] px-2 py-2.5 font-medium sm:px-3">
                    Reg. no.
                  </th>
                  <th className="w-[1%] max-w-24 min-w-24 px-2 py-2.5 text-center font-medium sm:px-3">
                    Attended
                  </th>
                  <th className="w-[1%] min-w-[6.5rem] px-2 py-2.5 font-medium sm:min-w-[7.5rem] sm:px-3">
                    Status
                  </th>
                  <th className="w-auto min-w-[8rem] px-3 py-2.5 font-medium">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => {
                  const held = Number.parseInt(totalHeld, 10) || 0;
                  const minP = Number.parseFloat(minPercent) || 0;
                  const pct = rowAttendancePercent(
                    held,
                    line.totalClassesAttended,
                  );
                  const meets = pct >= minP;

                  return (
                    <tr
                      key={line.studentId}
                      className={cn(
                        "border-t",
                        i % 2 ? "bg-muted/20" : undefined,
                      )}
                    >
                      <td className="px-3 py-2.5 align-top font-medium [overflow-wrap:anywhere]">
                        {line.fullName}
                      </td>
                      <td
                        className="min-w-[9.5rem] max-w-48 px-2 py-2.5 align-top sm:px-3"
                        title={line.registerNo ?? undefined}
                      >
                        <span className="text-muted-foreground text-sm tabular-nums leading-snug">
                          {line.registerNo ?? "—"}
                        </span>
                      </td>
                      <td className="w-24 min-w-24 max-w-24 px-2 py-2.5 sm:px-3">
                        <Input
                          type="number"
                          className="h-9 w-20 max-w-20"
                          min={0}
                          max={held || undefined}
                          value={line.totalClassesAttended}
                          onChange={(e) => {
                            updateLine(i, {
                              totalClassesAttended:
                                Number.parseInt(e.target.value, 10) || 0,
                            });
                          }}
                        />
                      </td>
                      <td className="min-w-[6.5rem] px-2 py-2.5 align-top sm:min-w-[7.5rem] sm:px-3">
                        <div className="flex flex-col gap-1.5 pr-0.5">
                          <span className="text-muted-foreground text-xs font-medium leading-none tabular-nums">
                            {pct}%
                          </span>
                          <Badge
                            className="w-fit text-xs font-normal"
                            variant={meets ? "default" : "destructive"}
                          >
                            {meets ? "Satisfactory" : "Below min."}
                          </Badge>
                        </div>
                      </td>
                      <td className="min-w-0 px-3 py-2.5 align-top">
                        <Textarea
                          className="min-h-[2.5rem] w-full text-sm"
                          value={line.remarks}
                          onChange={(e) => {
                            updateLine(i, { remarks: e.target.value });
                          }}
                          rows={2}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <SheetFooter className="border-t px-4 py-4">
          <Button
            type="button"
            onClick={() => {
              save();
            }}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
