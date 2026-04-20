"use client";

import { MoreVertical, Pencil, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import type { ProgramOutcome } from "@/lib/api/generated/models";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteProgramOutcomeDialog } from "./delete-program-outcome-dialog";
import { EditProgramOutcomeSheet } from "./edit-program-outcome-sheet";

function ProgramOutcomeRowActions({
  programOutcome,
}: {
  programOutcome: ProgramOutcome;
}) {
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
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <HugeiconsIcon icon={Trash} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProgramOutcomeSheet
        programOutcome={programOutcome}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteProgramOutcomeDialog
        programOutcome={programOutcome}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

export function getProgramOutcomeColumns(): ColumnDef<ProgramOutcome>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "—",
    },
    {
      accessorKey: "syllabus_scheme",
      header: "Scheme",
      cell: ({ row }) => row.original.syllabus_scheme || "—",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ProgramOutcomeRowActions programOutcome={row.original} />
      ),
    },
  ];
}
