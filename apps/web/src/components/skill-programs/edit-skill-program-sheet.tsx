"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { invalidateSkillProgramCaches } from "@/components/skill-programs/skill-program-query-invalidation";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useSkillProgramsUpdate } from "@/lib/api/generated/skill-program/skill-program";
import type { SkillProgram } from "@/lib/api/generated/models";
import { SkillProgramsUpdateBody } from "@/lib/api/generated/skill-program/skill-program.zod";
import z from "zod";
import {
  isoFromDateTimeLocal,
  skillProgramUpdateDefaults,
  toDateTimeLocalInputValue,
} from "./skill-program-form.helpers";

type SkillProgramUpdateValues = z.infer<typeof SkillProgramsUpdateBody>;

export function EditSkillProgramSheet({
  skillProgram,
  open,
  onOpenChange,
}: {
  skillProgram: SkillProgram;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<SkillProgramUpdateValues>({
    resolver: zodResolver(SkillProgramsUpdateBody),
    defaultValues: skillProgramUpdateDefaults(skillProgram),
  });

  useEffect(() => {
    if (open) {
      form.reset(skillProgramUpdateDefaults(skillProgram));
    }
  }, [open, skillProgram, form]);

  const updateMutation = useSkillProgramsUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update skill program");
            return;
          }
          await invalidateSkillProgramCaches(queryClient, skillProgram);
          toast.success("Skill program updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not update skill program",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: SkillProgramUpdateValues) {
    await updateMutation.mutateAsync({
      skillProgram: skillProgram.id,
      data: SkillProgramsUpdateBody.parse(values),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit skill program</SheetTitle>
          <SheetDescription>{skillProgram.details}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="edit-skill-program-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Program details"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resource_person_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource person</FormLabel>
                  <FormControl>
                    <Input placeholder="Resource person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="conducted_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conducted date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={toDateTimeLocalInputValue(field.value)}
                      onChange={(e) =>
                        field.onChange(isoFromDateTimeLocal(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="edit-skill-program-sheet-form"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
