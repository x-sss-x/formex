"use client";

import {
  LaborIcon,
  MoreVertical,
  Pencil,
  Trash,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DeleteHigherEducationDialog } from "@/components/higher-educations/delete-higher-education-dialog";
import { EditHigherEducationSheet } from "@/components/higher-educations/edit-higher-education-sheet";
import type { HigherEducation } from "@/lib/api/generated/models";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function HigherEducationRowActions({
  higherEducation,
}: {
  higherEducation: HigherEducation;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={MoreVertical} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setEditOpen(true);
              }}
            >
              <HugeiconsIcon icon={Pencil} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
            >
              <HugeiconsIcon icon={Trash} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditHigherEducationSheet
        higherEducation={higherEducation}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteHigherEducationDialog
        higherEducation={higherEducation}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export function getHigherEducationColumns(): ColumnDef<HigherEducation>[] {
  return [
    {
      accessorKey: "college_name",
      header: "College",
      cell(props) {
        const original = props.row.original;
        return (
          <div className="flex flex-row items-center gap-2.5">
            <HugeiconsIcon className="size-4" icon={LaborIcon} />
            <span>{original.college_name}</span>
          </div>
        );
      },
    },
    {
      id: "branch-semester",
      header: "Branch & Semester",
      cell({ row }) {
        const program = row.original.program;
        const semester = row.original.student?.semester;
        return (
          <div className="flex flex-row items-center gap-2.5">
            <Badge variant={"secondary"}>
              {program?.short_name} : SEM {semester}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = row.original.student;
        if (!student) {
          return <span className="text-muted-foreground">—</span>;
        }

        return student.register_no
          ? `${student.full_name} (${student.register_no})`
          : student.full_name;
      },
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: ({ row }) => <span>#{row.original.rank}</span>,
    },
    {
      accessorKey: "academic_year",
      header: "Academic Year",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <HigherEducationRowActions higherEducation={row.original} />
      ),
    },
  ];
}
