"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProgramOutcome } from "@/lib/api/generated/models";
import {
  getProgramOutcomesIndexQueryKey,
  getProgramOutcomeListByProgramQueryKey,
  useProgramOutcomesDestroy,
} from "@/lib/api/generated/program-outcome/program-outcome";

export function DeleteProgramOutcomeDialog({
  programOutcome,
  open,
  onOpenChange,
}: {
  programOutcome: ProgramOutcome;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const destroyMutation = useProgramOutcomesDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete program outcome");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getProgramOutcomesIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getProgramOutcomeListByProgramQueryKey(programOutcome.program_id),
          });
          toast.success("Program outcome deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete program outcome",
          );
        },
      },
    },
    queryClient,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete program outcome?</DialogTitle>
          <DialogDescription>
            This permanently removes the selected program outcome.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={destroyMutation.isPending}
            onClick={() =>
              void destroyMutation.mutateAsync({
                programOutcome: programOutcome.id as unknown as number,
              })
            }
          >
            {destroyMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
