"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuthUser } from "@/lib/api/generated/auth/auth";
import {
  courseMonthlyAttendanceStore,
  getCourseMonthlyAttendanceListByCourseQueryKey,
} from "@/lib/api/generated/course-monthly-attendance/course-monthly-attendance";
import type { Student } from "@/lib/api/generated/models/student";
import { useProgramsStudentsIndex } from "@/lib/api/generated/student/student";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { cn } from "@/lib/utils";
import { MinAttendanceMinClassesHint } from "./min-attendance-min-classes-hint";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

type Line = {
  studentId: string;
  fullName: string;
  registerNo: string | null;
  totalClassesAttended: number;
  remarks: string;
};

function toLines(students: Student[]): Line[] {
  return students.map((s) => ({
    studentId: s.id,
    fullName: s.full_name,
    registerNo: s.register_no ?? null,
    totalClassesAttended: 0,
    remarks: "",
  }));
}

export function CreateMonthlyAttendanceSheet({
  children,
  programId,
  subjectId,
}: {
  children: ReactNode;
  programId: string;
  subjectId: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [month, setMonth] = useState<string>("");
  const [totalHeld, setTotalHeld] = useState<string>("");
  const [minPercent, setMinPercent] = useState<string>("75");
  const [lines, setLines] = useState<Line[]>([]);
  const queryClient = useQueryClient();

  const { data: auth } = useAuthUser();
  const academicYear =
    auth?.status === 200 && auth.data.current_academic_year != null
      ? auth.data.current_academic_year
      : new Date().getFullYear();

  const subjectQ = useSubjectsShow(subjectId, {
    query: { enabled: open && !!subjectId },
  });
  const subject =
    subjectQ.data?.status === 200 ? subjectQ.data.data.data : null;
  const semester = subject?.semester ?? 0;

  const studentsQ = useProgramsStudentsIndex(programId, {
    query: { enabled: open && !!programId },
  });
  const allStudents: Student[] =
    studentsQ.data?.status === 200 ? studentsQ.data.data.data : [];

  const eligible = allStudents.filter(
    (s) => s.semester === semester && s.academic_year === academicYear,
  );

  const createMutation = useMutation({
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
      return courseMonthlyAttendanceStore(subjectId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: async (res) => {
      if (res.status >= 400) {
        const message =
          typeof (res.data as { message?: string })?.message === "string"
            ? (res.data as { message: string }).message
            : "Could not save attendance";
        toast.error(message);
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: getCourseMonthlyAttendanceListByCourseQueryKey(subjectId),
      });
      toast.success("Monthly attendance saved");
      reset();
      setOpen(false);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Could not save attendance");
    },
  });

  function reset() {
    setStep(1);
    setMonth("");
    setTotalHeld("");
    setMinPercent("75");
    setLines([]);
  }

  function goNext() {
    const m = Number(month);
    const total = Number.parseInt(totalHeld, 10);
    const minP = Number.parseFloat(minPercent);
    if (!Number.isFinite(m) || m < 1 || m > 12) {
      toast.error("Select a month");
      return;
    }
    if (!Number.isFinite(total) || total < 1) {
      toast.error("Enter total classes held (at least 1)");
      return;
    }
    if (!Number.isFinite(minP) || minP < 0 || minP > 100) {
      toast.error("Minimum attendance % must be between 0 and 100");
      return;
    }
    if (eligible.length === 0) {
      toast.error(
        "No students in this course (same program, semester, and academic year).",
      );
      return;
    }
    setLines(toLines(eligible));
    setStep(2);
  }

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

  function submit() {
    const m = Number(month);
    const total = Number.parseInt(totalHeld, 10);
    const minP = Number.parseFloat(minPercent);
    for (const line of lines) {
      if (line.totalClassesAttended < 0 || line.totalClassesAttended > total) {
        toast.error(
          "Each student’s attended count must be between 0 and total classes held.",
        );
        return;
      }
    }
    createMutation.mutate({
      month: m,
      academic_year: academicYear,
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          reset();
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex max-w-full flex-col gap-0 overflow-hidden data-[side=right]:!max-w-[min(64rem,58vw)] data-[side=right]:sm:!max-w-[min(64rem,58vw)]">
        <SheetHeader>
          <SheetTitle>Monthly course attendance</SheetTitle>
          <SheetDescription>
            Step {step} of 2:{" "}
            {step === 1
              ? "Period and class count"
              : "Per-student attended & remarks"}{" "}
            (academic year {academicYear})
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-4 sm:px-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((x) => (
                      <SelectItem key={x.value} value={String(x.value)}>
                        {x.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-held">Total classes held</Label>
                <Input
                  id="total-held"
                  type="number"
                  min={1}
                  value={totalHeld}
                  onChange={(e) => {
                    setTotalHeld(e.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-pct">Minimum attendance % required</Label>
                <Input
                  id="min-pct"
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
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Enter classes attended and optional remarks. Minimum required:{" "}
                <span className="text-foreground font-medium">
                  {minPercent}%
                </span>{" "}
                · Total classes:{" "}
                <span className="text-foreground font-medium">{totalHeld}</span>
              </p>
              <MinAttendanceMinClassesHint
                totalHeldStr={totalHeld}
                minPercentStr={minPercent}
              />
              <div className="max-h-[55vh] min-w-0 overflow-x-auto overflow-y-auto rounded-md border">
                <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-sm [tbody_tr:hover]:bg-muted/30">
                  <thead>
                    <tr className="bg-muted/50 text-left text-xs sm:text-sm">
                      <th className="w-[1%] min-w-[6.5rem] max-w-[12rem] px-3 py-2.5 font-medium">
                        Student
                      </th>
                      <th className="w-[1%] min-w-[9.5rem] px-2 py-2.5 font-medium sm:px-3">
                        Reg. no.
                      </th>
                      <th className="w-[1%] min-w-24 max-w-24 px-2 py-2.5 text-center font-medium sm:px-3">
                        Attended
                      </th>
                      <th className="w-auto min-w-[8rem] px-3 py-2.5 font-medium">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
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
                          <span className="text-muted-foreground text-sm leading-snug tabular-nums">
                            {line.registerNo ?? "—"}
                          </span>
                        </td>
                        <td className="w-24 min-w-24 max-w-24 px-2 py-2.5 sm:px-3">
                          <Input
                            type="number"
                            className="h-9 w-20 max-w-20"
                            min={0}
                            max={Number.parseInt(totalHeld, 10) || undefined}
                            value={line.totalClassesAttended}
                            onChange={(e) => {
                              updateLine(i, {
                                totalClassesAttended:
                                  Number.parseInt(e.target.value, 10) || 0,
                              });
                            }}
                          />
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="border-t px-4 py-4 sm:flex-row sm:justify-between">
          {step === 2 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep(1);
              }}
            >
              Back
            </Button>
          ) : (
            <span />
          )}
          {step === 1 ? (
            <Button
              type="button"
              onClick={() => {
                goNext();
              }}
            >
              Next: students
            </Button>
          ) : (
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                submit();
              }}
            >
              {createMutation.isPending ? "Saving…" : "Save attendance"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
