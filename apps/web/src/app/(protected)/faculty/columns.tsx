"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { Badge } from "../../../components/ui/badge";

export const facultySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  programs: z.array(z.object({ id: z.string(), name: z.string() })),
  subjects: z.array(z.object({ id: z.string(), name: z.string() })),
});

export type Faculty = z.infer<typeof facultySchema>;

export function getFacultyColumns(): ColumnDef<Faculty>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;

        return <Badge variant="outline">{role.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "programs",
      header: "Programs",
      cell: ({ row }) => {
        const programs = row.original.programs;
        return programs.length;
      },
    },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }) => {
        const subjects = row.original.subjects;
        return subjects.length;
      },
    },
  ];
}
