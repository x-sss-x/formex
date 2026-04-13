"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidateSkillProgramCaches } from "@/components/skill-programs/skill-program-query-invalidation";
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
import { useSkillProgramsDestroy } from "@/lib/api/generated/skill-program/skill-program";
import type { SkillProgram } from "@/lib/api/generated/models";

export function DeleteSkillProgramDialog({
  skillProgram,
  open,
  onOpenChange,
}: {
  skillProgram: SkillProgram;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const destroyMutation = useSkillProgramsDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete skill program");
            return;
          }
          await invalidateSkillProgramCaches(queryClient, skillProgram);
          toast.success("Skill program deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete skill program",
          );
        },
      },
    },
    queryClient,
  );

  async function onConfirm() {
    await destroyMutation.mutateAsync({ skillProgram: skillProgram.id });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete skill program?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the record for{" "}
            <span className="text-foreground font-medium">
              {skillProgram.company_name}
            </span>{" "}
            ({skillProgram.designation}). This action cannot be undone.
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
