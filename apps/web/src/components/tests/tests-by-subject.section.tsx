"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { SpinnerPage } from "@/components/spinner-page";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useSubjectsShow } from "@/lib/api/generated/subject/subject";
import { $api } from "@/lib/api/mutator";
import {
  AcademicTest,
  CourseOutcomeOption,
  TestFormDialog,
  TestPayload,
} from "./tests.page";

type ApiCollection<T> = {
  data: {
    data: T[];
  };
  status: number;
};

export function TestsBySubjectSection({
  subjectId,
}: {
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicTest | null>(null);
  const [deleting, setDeleting] = useState<AcademicTest | null>(null);

  const subjectQuery = useSubjectsShow(subjectId, {
    query: { enabled: !!subjectId },
  });
  const subject =
    subjectQuery.data?.status === 200 ? subjectQuery.data.data.data : null;
  const semester = subject ? Math.min(6, Math.max(1, subject.semester)) : 1;

  const testsQuery = useQuery({
    queryKey: ["subject-tests", subjectId],
    queryFn: async () => {
      return $api<ApiCollection<AcademicTest>>(`/subjects/${subjectId}/tests`);
    },
    enabled: !!subjectId,
  });
  const courseOutcomesQuery = useQuery({
    queryKey: ["subject-tests-course-outcomes", subjectId],
    queryFn: async () => {
      return $api<ApiCollection<CourseOutcomeOption>>(
        `/subjects/${subjectId}/tests/course-outcomes`,
      );
    },
    enabled: !!subjectId,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: TestPayload) => {
      return $api(`/subjects/${subjectId}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subject-tests", subjectId] });
      toast.success("Test created.");
      setCreateOpen(false);
    },
    onError: () => toast.error("Could not create test."),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      testId,
      payload,
    }: {
      testId: string;
      payload: TestPayload;
    }) => {
      return $api(`/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subject-tests", subjectId] });
      toast.success("Test updated.");
      setEditing(null);
    },
    onError: () => toast.error("Could not update test."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (testId: string) => {
      return $api(`/tests/${testId}`, { method: "DELETE" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subject-tests", subjectId] });
      toast.success("Test deleted.");
      setDeleting(null);
    },
    onError: () => toast.error("Could not delete test."),
  });

  const rows = testsQuery.data?.status === 200 ? testsQuery.data.data.data : [];
  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((row) =>
      [row.name, String(row.maximum_marks), String(row.minimum_passing_marks)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, search]);
  const courseOutcomes =
    courseOutcomesQuery.data?.status === 200
      ? courseOutcomesQuery.data.data.data
      : [];

  const columns = useMemo<ColumnDef<AcademicTest>[]>(() => {
    return [
      { accessorKey: "name", header: "Test Name" },
      { accessorKey: "cie_number", header: "CIE No" },
      { accessorKey: "maximum_marks", header: "Maximum Marks" },
      { accessorKey: "minimum_passing_marks", header: "Minimum Passing" },
      { accessorKey: "total_assigned_marks", header: "Total Assigned" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(row.original)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleting(row.original)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];
  }, []);

  if (subjectQuery.isLoading) {
    return <SpinnerPage />;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="max-w-sm min-w-[200px]">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search tests..."
            value={search}
            onChange={(e) => void setSearch(e.target.value || null)}
          />
        </InputGroup>
        <Button onClick={() => setCreateOpen(true)}>
          Add <HugeiconsIcon icon={PlusSignIcon} />
        </Button>
      </div>

      {testsQuery.isLoading ? (
        <SpinnerPage />
      ) : (
        <DataTable columns={columns} data={visibleRows} />
      )}

      <TestFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        semester={semester}
        courseOutcomes={courseOutcomes}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
        isSubmitting={createMutation.isPending}
      />

      <TestFormDialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
          }
        }}
        semester={semester}
        initial={editing}
        courseOutcomes={courseOutcomes}
        onSubmit={async (payload) => {
          if (!editing) {
            return;
          }
          await updateMutation.mutateAsync({ testId: editing.id, payload });
        }}
        isSubmitting={updateMutation.isPending}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleting?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && void deleteMutation.mutateAsync(deleting.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
