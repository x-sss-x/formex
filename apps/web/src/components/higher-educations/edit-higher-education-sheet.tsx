"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { invalidateHigherEducationCaches } from "@/components/higher-educations/higher-education-query-invalidation";
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
import { useHigherEducationsUpdate } from "@/lib/api/generated/higher-education/higher-education";
import { HigherEducationsUpdateBody } from "@/lib/api/generated/higher-education/higher-education.zod";
import type { HigherEducation } from "@/lib/api/generated/models";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import z from "zod";
import { higherEducationDefaults } from "./higher-education-form.helpers";

export function EditHigherEducationSheet({
  higherEducation,
  open,
  onOpenChange,
}: {
  higherEducation: HigherEducation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(HigherEducationsUpdateBody),
    defaultValues: higherEducationDefaults(higherEducation),
  });

  useEffect(() => {
    if (open) {
      form.reset(higherEducationDefaults(higherEducation));
    }
  }, [open, higherEducation, form]);

  const updateMutation = useHigherEducationsUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update higher education record");
            return;
          }

          await invalidateHigherEducationCaches(queryClient, higherEducation);
          toast.success("Higher education record updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not update higher education record",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: z.infer<typeof HigherEducationsUpdateBody>) {
    await updateMutation.mutateAsync({
      higherEducation: higherEducation.id,
      data: values,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit higher education</SheetTitle>
          <SheetDescription>
            {higherEducation.college_name} · Rank {higherEducation.rank}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="edit-higher-education-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <FormField
              control={form.control}
              name="college_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College name</FormLabel>
                  <FormControl>
                    <Input placeholder="College or university" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rank</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(e) =>
                        field.onChange(
                          Number.isFinite(e.target.valueAsNumber)
                            ? e.target.valueAsNumber
                            : 1,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <SheetFooter className="border-t px-6 py-4 sm:flex-row">
            <Button
              type="submit"
              form="edit-higher-education-sheet-form"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
