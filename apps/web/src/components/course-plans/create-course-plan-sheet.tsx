"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft01Icon,
  Search01Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import {
  getCoursePlansIndexQueryKey,
  useCoursePlanStore,
} from "@/lib/api/generated/course-plan/course-plan";
import { CoursePlanStoreBody } from "@/lib/api/generated/course-plan/course-plan.zod";
import { useFacultyIndex } from "@/lib/api/generated/institution-faculty/institution-faculty";
import { useSubjectsIndex } from "@/lib/api/generated/subject/subject";
import z from "zod";
import {
  coursePlanDefaults,
  isoFromDateTimeLocal,
  toDateTimeLocalInputValue,
} from "./course-plan-form.helpers";

type CoursePlanCreateValues = z.infer<typeof CoursePlanStoreBody>;
type Step = "search" | "form";

export function CreateCoursePlanSheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("search");
  const [draftQuery, setDraftQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const queryClient = useQueryClient();
  const form = useForm<CoursePlanCreateValues>({
    resolver: zodResolver(CoursePlanStoreBody),
    defaultValues: coursePlanDefaults(),
  });

  const subjectsQuery = useSubjectsIndex({ query: { enabled: open && step === "search" } });
  const facultyQuery = useFacultyIndex({ query: { enabled: open } });

  const subjects =
    subjectsQuery.data?.status === 200 ? subjectsQuery.data.data.data : [];
  const facultyRows =
    facultyQuery.data?.status === 200 ? facultyQuery.data.data.data : [];

  const coordinatorOptions = useMemo(() => {
    if (!selectedCourseId) {
      return [];
    }
    return facultyRows.filter((faculty) => {
      return (
        ["course_coordinator", "program_coordinator"].includes(faculty.role) &&
        faculty.subjects.some((subject) => subject.id === selectedCourseId)
      );
    });
  }, [facultyRows, selectedCourseId]);
  const visibleSubjects = useMemo(() => {
    if (!submittedQuery.trim()) {
      return [];
    }
    const q = submittedQuery.toLowerCase();
    return subjects.filter((subject) => {
      return [subject.name, subject.short_name, `sem ${subject.semester}`]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [subjects, submittedQuery]);

  const storeMutation = useCoursePlanStore(
    {
      mutation: {
        onSuccess: async (res) => {
          if (res.status >= 400) {
            toast.error("Could not create course plan");
            return;
          }
          await queryClient.invalidateQueries({
            queryKey: getCoursePlansIndexQueryKey(),
          });
          toast.success("Course plan created");
          setOpen(false);
          setStep("search");
          setDraftQuery("");
          setSubmittedQuery("");
          setSelectedCourseId("");
          setSelectedSubjectName("");
          form.reset(coursePlanDefaults());
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Could not create course plan",
          );
        },
      },
    },
    queryClient,
  );

  async function onSubmit(values: CoursePlanCreateValues) {
    if (!selectedCourseId) {
      toast.error("Select course first");
      return;
    }
    await storeMutation.mutateAsync({
      subject: selectedCourseId,
      data: CoursePlanStoreBody.parse(values),
    });
  }
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = draftQuery.trim();
    if (!q) {
      toast.error("Enter a search term");
      return;
    }
    setSubmittedQuery(q);
  }
  function selectSubject(subjectId: string, subjectName: string) {
    setSelectedCourseId(subjectId);
    setSelectedSubjectName(subjectName);
    form.setValue("course_coordinator_id", "");
    setStep("form");
  }
  function goBackToSearch() {
    setStep("search");
    setSelectedCourseId("");
    setSelectedSubjectName("");
    form.reset(coursePlanDefaults());
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setStep("search");
          setDraftQuery("");
          setSubmittedQuery("");
          setSelectedCourseId("");
          setSelectedSubjectName("");
          form.reset(coursePlanDefaults());
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New course plan</SheetTitle>
          <SheetDescription>
            {step === "search"
              ? "Search and select a subject first."
              : `Course plan details for ${selectedSubjectName || "subject"}.`}
          </SheetDescription>
        </SheetHeader>
        {step === "search" ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            <form className="flex flex-row gap-1.5 py-2" onSubmit={handleSearchSubmit}>
              <InputGroup className="w-full">
                <InputGroupAddon>
                  <HugeiconsIcon icon={Search01Icon} />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search subjects..."
                  value={draftQuery}
                  onChange={(e) => setDraftQuery(e.target.value)}
                />
              </InputGroup>
              <Button type="submit">Search</Button>
            </form>
            {submittedQuery ? (
              <div className="flex flex-col gap-2">
                {visibleSubjects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No subjects found. Try a different search.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {visibleSubjects.map((subject) => (
                      <li key={subject.id}>
                        <button
                          type="button"
                          onClick={() =>
                            selectSubject(subject.id, `${subject.name} (Sem ${subject.semester})`)
                          }
                          className="hover:bg-muted/60 flex w-full flex-row items-center gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors"
                        >
                          <HugeiconsIcon
                            className="text-muted-foreground size-4 shrink-0"
                            icon={User02Icon}
                          />
                          <span className="min-w-0 truncate">
                            {subject.name} ({subject.short_name}) - Sem {subject.semester}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Enter a course name or short name, then click Search.
              </p>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form
              id="create-course-plan-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
            >
              <Button
                type="button"
                variant="ghost"
                className="w-fit gap-1.5 px-2"
                onClick={goBackToSearch}
              >
                <HugeiconsIcon className="size-4" icon={ArrowLeft01Icon} />
                Change subject
              </Button>
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Input value={selectedSubjectName} disabled />
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
                            e.target.value ? isoFromDateTimeLocal(e.target.value) : null,
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
                form="create-course-plan-form"
                disabled={storeMutation.isPending}
              >
                {storeMutation.isPending ? "Saving..." : "Save course plan"}
              </Button>
            </SheetFooter>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
