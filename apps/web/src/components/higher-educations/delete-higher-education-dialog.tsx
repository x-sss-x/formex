"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateHigherEducationCaches } from "@/components/higher-educations/higher-education-query-invalidation";
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
import { useHigherEducationsDestroy } from "@/lib/api/generated/higher-education/higher-education";
import type { HigherEducation } from "@/lib/api/generated/models";

export function DeleteHigherEducationDialog({
  higherEducation,
  open,
  onOpenChange,
}: {
  higherEducation: HigherEducation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const destroyMutation = useHigherEducationsDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete higher education record");
            return;
          }
          await invalidateHigherEducationCaches(queryClient, higherEducation);
          toast.success("Higher education record deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not delete higher education record",
          );
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await destroyMutation.mutateAsync({ higherEducation: higherEducation.id });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete higher education record?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="text-foreground font-medium">
              {higherEducation.college_name}
            </span>{" "}
            (rank {higherEducation.rank}). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={destroyMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={destroyMutation.isPending}
          >
            {destroyMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
