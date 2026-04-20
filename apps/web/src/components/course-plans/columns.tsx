"use client";

import { MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CoursePlan } from "@/lib/api/generated/models";
import { DeleteCoursePlanDialog } from "./delete-course-plan-dialog";
import { EditCoursePlanSheet } from "./edit-course-plan-sheet";

function CoursePlanRowActions({ coursePlan }: { coursePlan: CoursePlan }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={MoreVertical} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <HugeiconsIcon icon={Pencil} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <HugeiconsIcon icon={Trash} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCoursePlanSheet
        coursePlan={coursePlan}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteCoursePlanDialog
        coursePlan={coursePlan}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return format(date, "dd MMM yyyy");
}

export function getCoursePlanColumns(): ColumnDef<CoursePlan>[] {
  return [
    {
      id: "course",
      header: "Course",
      cell: ({ row }) => row.original.course?.name ?? "—",
    },
    {
      id: "coordinator",
      header: "Coordinator",
      cell: ({ row }) => row.original.course_coordinator?.name ?? "—",
    },
    {
      id: "week-topic",
      header: "Week / Topic",
      cell: ({ row }) => (
        <Badge variant="secondary">
          W{row.original.week_no} · T{row.original.topic_no}
        </Badge>
      ),
    },
    {
      id: "planned",
      header: "Planned",
      cell: ({ row }) => formatDate(row.original.planned_date),
    },
    {
      id: "completed",
      header: "Completed",
      cell: ({ row }) => formatDate(row.original.completed_date),
    },
    {
      id: "actions",
      cell: ({ row }) => <CoursePlanRowActions coursePlan={row.original} />,
    },
  ];
}
