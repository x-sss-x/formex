"use client";

import {
  Edit02Icon,
  PlusSignIcon,
  Search01Icon,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { SpinnerPage } from "@/components/spinner-page";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  courseMonthlyAttendancesDestroy,
  getCourseMonthlyAttendanceListByCourseQueryKey,
  useCourseMonthlyAttendanceListByCourse,
} from "@/lib/api/generated/course-monthly-attendance/course-monthly-attendance";
import type { CourseMonthlyAttendance } from "@/lib/api/generated/models/courseMonthlyAttendance";
import { CreateMonthlyAttendanceSheet } from "./create-monthly-attendance.sheet";
import { EditMonthlyAttendanceSheet } from "./edit-monthly-attendance.sheet";

const monthLabel = (month: number) =>
  format(new Date(2000, month - 1, 1), "MMMM");

function averageAttendancePercent(r: CourseMonthlyAttendance): number | null {
  const students = r.attendance_students ?? [];
  if (students.length === 0) {
    return null;
  }
  const sum = students.reduce((acc, a) => acc + a.attendance_percent, 0);
  return Math.round((sum / students.length) * 100) / 100;
}

export function CourseMonthlyAttendanceBySubjectSection({
  programId,
  subjectId,
}: {
  programId: string;
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useQueryState(
    "att_q",
    parseAsString
      .withDefault("")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );
  const listQuery = useCourseMonthlyAttendanceListByCourse(subjectId, {
    query: { enabled: !!subjectId },
  });
  const rows: CourseMonthlyAttendance[] =
    listQuery.data?.status === 200 ? listQuery.data.data.data : [];

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CourseMonthlyAttendance | null>(null);

  const q = search.trim().toLowerCase();
  const visibleRows = useMemo(() => {
    if (!q) {
      return rows;
    }
    return rows.filter((r) => {
      const m = monthLabel(r.month);
      const avg = averageAttendancePercent(r);
      return `${m} ${r.academic_year} ${r.total_classes_held} ${r.minimum_attendance_percent} ${avg ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [rows, q]);

  async function onDelete(id: string) {
    if (!window.confirm("Delete this monthly attendance record?")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await courseMonthlyAttendancesDestroy(id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status >= 400) {
        toast.error("Could not delete attendance");
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: getCourseMonthlyAttendanceListByCourseQueryKey(subjectId),
      });
      toast.success("Monthly attendance removed");
    } catch {
      toast.error("Could not delete attendance");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: ColumnDef<CourseMonthlyAttendance>[] = [
    {
      id: "period",
      header: "Month",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <div className="font-medium text-foreground">
              {monthLabel(r.month)} {r.academic_year}
            </div>
            <div className="text-muted-foreground text-sm">
              Min. required: {r.minimum_attendance_percent}%
            </div>
          </div>
        );
      },
    },
    {
      id: "held",
      header: "Held",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.total_classes_held}</span>
      ),
    },
    {
      id: "average",
      header: "Average %",
      cell: ({ row }) => {
        const avg = averageAttendancePercent(row.original);
        if (avg === null) {
          return "—";
        }
        return <span className="tabular-nums">{avg}%</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                setEditing(r);
              }}
              aria-label="Edit monthly attendance"
            >
              <HugeiconsIcon icon={Edit02Icon} />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={deletingId === r.id}
              onClick={() => {
                void onDelete(r.id);
              }}
              aria-label="Delete monthly attendance"
            >
              <HugeiconsIcon icon={Trash} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="max-w-sm min-w-[200px]">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by month, year, or class count…"
            value={search}
            onChange={(e) => void setSearch(e.target.value || null)}
          />
        </InputGroup>
        <CreateMonthlyAttendanceSheet
          programId={programId}
          subjectId={subjectId}
        >
          <Button>
            Add month <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </CreateMonthlyAttendanceSheet>
      </div>
      {listQuery.isLoading ? (
        <SpinnerPage />
      ) : (
        <DataTable data={visibleRows} columns={columns} />
      )}

      {editing ? (
        <EditMonthlyAttendanceSheet
          key={editing.id}
          programId={programId}
          subjectId={subjectId}
          initial={editing}
          open
          onOpenChange={(open: boolean) => {
            if (!open) {
              setEditing(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
