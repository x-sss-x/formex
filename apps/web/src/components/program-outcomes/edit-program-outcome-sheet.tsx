"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  getProgramOutcomesIndexQueryKey,
  getProgramOutcomeListByProgramQueryKey,
  useProgramOutcomesUpdate,
} from "@/lib/api/generated/program-outcome/program-outcome";
import type { ProgramOutcome } from "@/lib/api/generated/models";
import type { ProgramOutcomesUpdateBody } from "@/lib/api/generated/models/programOutcomesUpdateBody";
import {
  ProgramOutcomeFormSchema,
  type ProgramOutcomeFormValues,
  PROGRAM_OUTCOME_TYPE_LABELS,
  PROGRAM_OUTCOME_TYPES,
  programOutcomeToFormValues,
} from "./program-outcome-form.helpers";

export function EditProgramOutcomeSheet({
  programOutcome,
  open,
  onOpenChange,
}: {
  programOutcome: ProgramOutcome;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<ProgramOutcomeFormValues>({
    resolver: zodResolver(ProgramOutcomeFormSchema),
    values: programOutcomeToFormValues(programOutcome),
  });

  const updateMutation = useProgramOutcomesUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update program outcome");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getProgramOutcomesIndexQueryKey(),
          });
          await queryClient.invalidateQueries({
            queryKey: getProgramOutcomeListByProgramQueryKey(programOutcome.program_id),
          });
          toast.success("Program outcome updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not update program outcome",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: ProgramOutcomeFormValues) {
    await updateMutation.mutateAsync({
      programOutcome: programOutcome.id,
      data: ProgramOutcomeFormSchema.parse(values) as ProgramOutcomesUpdateBody,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit program outcome</SheetTitle>
          <SheetDescription>{programOutcome.program?.name ?? "Program"}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="edit-program-outcome-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROGRAM_OUTCOME_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {PROGRAM_OUTCOME_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="syllabus_scheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Syllabus Scheme</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <SheetFooter className="border-t px-4 py-4 sm:flex-row">
            <Button
              type="submit"
              form="edit-program-outcome-form"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
