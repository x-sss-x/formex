"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Student } from "@/lib/api/generated/models/student";
import { useProgramsStudentsUpdate } from "@/lib/api/generated/student/student";
import { ProgramsStudentsUpdateBody } from "@/lib/api/generated/student/student.zod";
import {
  dateInputValueFromIso,
  getProgramsStudentsQueryKey,
  isoFromDateInput,
} from "./student-form";

type EditStudentFormValues = z.infer<typeof ProgramsStudentsUpdateBody>;

function studentToFormValues(s: Student): EditStudentFormValues {
  return {
    full_name: s.full_name,
    academic_year: s.academic_year,
    semester: s.semester,
    date_of_birth: s.date_of_birth ?? undefined,
    register_no: s.register_no ?? undefined,
    email: s.email ?? undefined,
    gender: s.gender ?? undefined,
    category: s.category ?? undefined,
    mobile: s.mobile ?? undefined,
    appar_id: s.appar_id ?? undefined,
  };
}

export function EditStudentSheet({
  student,
  programId,
  listSemester,
  open,
  onOpenChange,
}: {
  student: Student;
  programId: string;
  listSemester: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const queryKey = getProgramsStudentsQueryKey(programId);

  const form = useForm<EditStudentFormValues>({
    resolver: zodResolver(ProgramsStudentsUpdateBody),
    defaultValues: studentToFormValues(student),
  });

  useEffect(() => {
    if (open) {
      form.reset(studentToFormValues(student));
    }
  }, [open, student, form]);

  const updateMutation = useProgramsStudentsUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update student");
            return;
          }
          await queryClient.invalidateQueries({ queryKey });
          toast.success("Student updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not update student",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: EditStudentFormValues) {
    await updateMutation.mutateAsync({
      program: programId,
      student: student.id,
      data: ProgramsStudentsUpdateBody.parse({
        ...values,
        semester: listSemester,
      }),
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit student</SheetTitle>
          <SheetDescription>Semester {listSemester}</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="edit-student-sheet-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-4"
          >
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="register_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register no</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2000}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={dateInputValueFromIso(field.value ?? null)}
                      onChange={(e) =>
                        field.onChange(isoFromDateInput(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    value={field.value ?? "__none__"}
                    onValueChange={(v) =>
                      field.onChange(v === "__none__" ? undefined : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
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
            form="edit-student-sheet-form"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
