"use client";

import { MoreVertical, Pencil, Trash, User02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useState } from "react";
import { DeleteSkillProgramDialog } from "@/components/skill-programs/delete-skill-program-dialog";
import { EditSkillProgramSheet } from "@/components/skill-programs/edit-skill-program-sheet";
import type { SkillProgram } from "@/lib/api/generated/models";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

function SkillProgramRowActions({ skillProgram }: { skillProgram: SkillProgram }) {
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

      <EditSkillProgramSheet
        skillProgram={skillProgram}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteSkillProgramDialog
        skillProgram={skillProgram}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export function getSkillProgramColumns(): ColumnDef<SkillProgram>[] {
  return [
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => {
        const student = row.original.student;
        if (!student) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex flex-row items-center gap-2.5">
            <HugeiconsIcon className="size-4" icon={User02Icon} />
            <span>
              {student.register_no
                ? `${student.full_name} (${student.register_no})`
                : student.full_name}
            </span>
          </div>
        );
      },
    },
    {
      id: "semester",
      header: "Semester",
      cell: ({ row }) => (
        <Badge variant="secondary">SEM {row.original.semester}</Badge>
      ),
    },
    {
      accessorKey: "company_name",
      header: "Company",
    },
    {
      accessorKey: "designation",
      header: "Designation",
    },
    {
      accessorKey: "resource_person_name",
      header: "Resource Person",
    },
    {
      accessorKey: "conducted_date",
      header: "Conducted Date",
      cell: ({ row }) => {
        const raw = row.original.conducted_date;
        if (!raw) {
          return "—";
        }
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) {
          return raw;
        }
        return format(date, "dd MMM yyyy");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <SkillProgramRowActions skillProgram={row.original} />,
    },
  ];
}
