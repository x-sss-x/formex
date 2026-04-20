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
import type { CoursePlan } from "@/lib/api/generated/models";
import {
  getCoursePlansIndexQueryKey,
  useCoursePlansDestroy,
} from "@/lib/api/generated/course-plan/course-plan";

export function DeleteCoursePlanDialog({
  coursePlan,
  open,
  onOpenChange,
}: {
  coursePlan: CoursePlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const destroyMutation = useCoursePlansDestroy(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not delete course plan");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getCoursePlansIndexQueryKey(),
          });
          toast.success("Course plan deleted");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not delete course plan",
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
          <DialogTitle>Delete course plan?</DialogTitle>
          <DialogDescription>
            This removes the selected weekly topic plan permanently.
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
                coursePlan: coursePlan.id as unknown as number,
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
