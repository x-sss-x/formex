"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useProgramList } from "@/lib/api/hooks/useProgramList";
import {
  getProgramOutcomesIndexQueryKey,
  getProgramOutcomeListByProgramQueryKey,
  useProgramOutcomeStore,
} from "@/lib/api/generated/program-outcome/program-outcome";
import type { ProgramOutcomeStoreBody } from "@/lib/api/generated/models/programOutcomeStoreBody";
import {
  ProgramOutcomeFormSchema,
  type ProgramOutcomeFormValues,
  PROGRAM_OUTCOME_TYPE_LABELS,
  PROGRAM_OUTCOME_TYPES,
  programOutcomeCreateDefaults,
} from "./program-outcome-form.helpers";

export function CreateProgramOutcomeSheet({
  children,
  programId: fixedProgramId,
}: {
  children: ReactNode;
  programId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [programId, setProgramId] = useState(fixedProgramId ?? "");
  const selectedProgramId = fixedProgramId ?? programId;
  const queryClient = useQueryClient();
  const { programs } = useProgramList({ enabled: !fixedProgramId });
  const form = useForm<ProgramOutcomeFormValues>({
    resolver: zodResolver(ProgramOutcomeFormSchema),
    defaultValues: programOutcomeCreateDefaults(),
  });

  const sortedPrograms = useMemo(() => {
    return [...(programs ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [programs]);

  const storeMutation = useProgramOutcomeStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status >= 400) {
            toast.error("Could not create program outcome");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getProgramOutcomesIndexQueryKey(),
          });
          if (selectedProgramId) {
            await queryClient.invalidateQueries({
              queryKey: getProgramOutcomeListByProgramQueryKey(selectedProgramId),
            });
          }
          toast.success("Program outcome created");
          setOpen(false);
          if (!fixedProgramId) {
            setProgramId("");
          }
          form.reset(programOutcomeCreateDefaults());
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not create program outcome",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: ProgramOutcomeFormValues) {
    if (!selectedProgramId) {
      toast.error("Select program first");
      return;
    }
    await storeMutation.mutateAsync({
      program: selectedProgramId,
      data: ProgramOutcomeFormSchema.parse(values) as ProgramOutcomeStoreBody,
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setProgramId(fixedProgramId ?? "");
          form.reset(programOutcomeCreateDefaults());
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New program outcome</SheetTitle>
          <SheetDescription>Create a program-level outcome entry.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="create-program-outcome-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
          >
            {!fixedProgramId ? (
              <FormItem>
                <FormLabel>Program</FormLabel>
                <Select value={programId} onValueChange={setProgramId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sortedPrograms.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            ) : null}

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
                    <Input placeholder="Program outcome name" {...field} />
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
                    <Input placeholder="C25 / R22 / etc." {...field} value={field.value ?? ""} />
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
                    <Textarea rows={4} placeholder="Description" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <SheetFooter className="border-t px-4 py-4 sm:flex-row">
            <Button
              type="submit"
              form="create-program-outcome-form"
              disabled={storeMutation.isPending}
            >
              {storeMutation.isPending ? "Saving..." : "Save program outcome"}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
