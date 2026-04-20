"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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
  getCoursePlansIndexQueryKey,
  useCoursePlansUpdate,
} from "@/lib/api/generated/course-plan/course-plan";
import { CoursePlansUpdateBody } from "@/lib/api/generated/course-plan/course-plan.zod";
import { useFacultyIndex } from "@/lib/api/generated/institution-faculty/institution-faculty";
import type { CoursePlan } from "@/lib/api/generated/models";
import z from "zod";
import {
  coursePlanToFormValues,
  isoFromDateTimeLocal,
  toDateTimeLocalInputValue,
} from "./course-plan-form.helpers";

type CoursePlanUpdateValues = z.infer<typeof CoursePlansUpdateBody>;

export function EditCoursePlanSheet({
  coursePlan,
  open,
  onOpenChange,
}: {
  coursePlan: CoursePlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<CoursePlanUpdateValues>({
    resolver: zodResolver(CoursePlansUpdateBody),
    values: coursePlanToFormValues(coursePlan),
  });

  const facultyQuery = useFacultyIndex({ query: { enabled: open } });
  const facultyRows =
    facultyQuery.data?.status === 200 ? facultyQuery.data.data.data : [];
  const coordinatorOptions = useMemo(() => {
    return facultyRows.filter((faculty) => {
      return (
        ["course_coordinator", "program_coordinator"].includes(faculty.role) &&
        faculty.subjects.some((subject) => subject.id === coursePlan.course_id)
      );
    });
  }, [coursePlan.course_id, facultyRows]);

  const updateMutation = useCoursePlansUpdate(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status !== 200) {
            toast.error("Could not update course plan");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getCoursePlansIndexQueryKey(),
          });
          toast.success("Course plan updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not update course plan",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: CoursePlanUpdateValues) {
    await updateMutation.mutateAsync({
      coursePlan: coursePlan.id as unknown as number,
      data: values,
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit course plan</SheetTitle>
          <SheetDescription>
            {coursePlan.course?.name ?? "Course"} - week {coursePlan.week_no}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="edit-course-plan-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
          >
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Input value={coursePlan.course?.name ?? "—"} disabled />
            </FormItem>
            <FormField
              control={form.control}
              name="course_coordinator_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Coordinator</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coordinator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coordinatorOptions.map((coordinator) => (
                        <SelectItem key={coordinator.id} value={coordinator.id}>
                          {coordinator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="week_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week No</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value || 1))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic No</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value || 1))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="planned_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planned Date</FormLabel>
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
            <FormField
              control={form.control}
              name="completed_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={toDateTimeLocalInputValue(field.value)}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? isoFromDateTimeLocal(e.target.value)
                            : null,
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
              name="teaching_aids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teaching Aids</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcome</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <SheetFooter className="border-t px-4 py-4 sm:flex-row">
            <Button
              type="submit"
              form="edit-course-plan-form"
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
