"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { $api } from "@/lib/api/mutator";
import type { Student } from "@/lib/api/generated/models/student";
import { getProgramsStudentsQueryKey } from "./student-form";
import { Button } from "../ui/button";
import { useProgramsStudentsDestroy } from "@/lib/api/generated/student/student";

type ApiEnvelope<T> = {
  data: T;
  status: number;
  headers: Headers;
};

type StudentDestroyJson = {
  message: string;
};

export function DeleteStudentDialog({
  student,
  programId,
  open,
  onOpenChange,
}: {
  student: Student;
  programId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const queryKey = getProgramsStudentsQueryKey(programId);

  const deleteMutation = useProgramsStudentsDestroy(
    {
      mutation: {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey });
          toast.success("Student deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete student",
          );
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await deleteMutation.mutateAsync({
      program: programId,
      student: student.id,
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete student?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes{" "}
            <span className="text-foreground font-medium">
              {student.full_name}
            </span>{" "}
            from the list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={() => void onConfirm()}
            disabled={deleteMutation.isPending}
            variant={"destructive"}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
