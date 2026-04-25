"use client";

import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchParams } from "next/navigation";
import { parseAsString, throttle, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { SpinnerPage } from "@/components/spinner-page";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useCourseOutcomeListByCourse } from "@/lib/api/generated/course-outcome/course-outcome";
import { useProgramOutcomeListByProgram } from "@/lib/api/generated/program-outcome/program-outcome";
import { $api } from "@/lib/api/mutator";
import { CreateCourseOutcomeSheet } from "./create-course-outcome-sheet";
import { getCourseOutcomeColumns } from "./columns";

type CoPoPsoStrengthRow = {
  course_outcome_id: string;
  program_outcome_id: string;
  semester: number;
  strength: number;
};

type CoPoPsoStrengthListResponse = {
  data: {
    data: CoPoPsoStrengthRow[];
  };
  status: number;
  headers: Headers;
};

const areSelectionsEqual = (
  left: Record<string, string>,
  right: Record<string, string>,
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }
  return true;
};

export function CourseOutcomesBySubjectSection({
  programId,
  subjectId,
}: {
  programId: string;
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );
  const [matrixSelections, setMatrixSelections] = useState<
    Record<string, string>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const semester = Number.isFinite(Number(searchParams.get("semester")))
    ? Math.min(6, Math.max(1, Number(searchParams.get("semester"))))
    : 1;
  const outcomesQuery = useCourseOutcomeListByCourse(subjectId, {
    query: { enabled: !!subjectId },
  });
  const rows = useMemo(
    () => (outcomesQuery.data?.status === 200 ? outcomesQuery.data.data.data : []),
    [outcomesQuery.data],
  );
  const programOutcomesQuery = useProgramOutcomeListByProgram(programId, {
    query: { enabled: !!programId },
  });
  const mappingOutcomes = useMemo(
    () =>
      programOutcomesQuery.data?.status === 200
        ? programOutcomesQuery.data.data.data.filter(
            (outcome) =>
              outcome.type === "program_outcome" ||
              outcome.type === "program_specific_outcome",
          )
        : [],
    [programOutcomesQuery.data],
  );
  const strengthsQuery = useQuery({
    queryKey: ["co-po-pso-strengths", programId, semester],
    queryFn: async () => {
      return $api<CoPoPsoStrengthListResponse>(
        `/programs/${programId}/co-po-pso-strengths?semester=${semester}`,
      );
    },
    enabled: !!programId,
  });

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((entry) => {
      return [
        entry.name ?? "",
        entry.description ?? "",
        entry.syllabus_scheme ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search]);

  const columns = useMemo(() => getCourseOutcomeColumns(), []);
  const isStrengthLoading = strengthsQuery.isLoading;
  const courseOutcomeIds = useMemo(
    () => new Set(rows.map((row) => row.id)),
    [rows],
  );

  useEffect(() => {
    const entries =
      strengthsQuery.data?.status === 200 ? strengthsQuery.data.data.data : [];
    const next: Record<string, string> = {};
    for (const row of entries) {
      if (courseOutcomeIds.has(row.course_outcome_id)) {
        next[`${row.course_outcome_id}:${row.program_outcome_id}`] = String(
          row.strength,
        );
      }
    }
    setMatrixSelections((prev) => (areSelectionsEqual(prev, next) ? prev : next));
    setHasUnsavedChanges(false);
  }, [courseOutcomeIds, strengthsQuery.data]);

  const strengthMutation = useMutation({
    mutationFn: async (payload: {
      rows: Array<{
        course_outcome_id: string;
        program_outcome_id: string;
        strength: number;
      }>;
    }) => {
      return $api<CoPoPsoStrengthListResponse>(
        `/programs/${programId}/co-po-pso-strengths`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            semester,
            rows: payload.rows,
          }),
        },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["co-po-pso-strengths", programId, semester],
      });
    },
    onError: () => {
      toast.error("Could not save mapping strength.");
    },
  });

  const setMatrixStrength = (
    coId: string,
    outcomeId: string,
    value: string,
  ) => {
    const key = `${coId}:${outcomeId}`;
    setMatrixSelections((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveMappings = async () => {
    const rowsToSave: Array<{
      course_outcome_id: string;
      program_outcome_id: string;
      strength: number;
    }> = [];
    for (const co of rows) {
      for (const outcome of mappingOutcomes) {
        const value = matrixSelections[`${co.id}:${outcome.id}`];
        const strength = Number(value);
        if (Number.isInteger(strength) && strength >= 1 && strength <= 3) {
          rowsToSave.push({
            course_outcome_id: co.id,
            program_outcome_id: outcome.id,
            strength,
          });
        }
      }
    }
    if (rowsToSave.length === 0) {
      toast.info("No valid mapping strengths to save for this subject.");
      return;
    }
    await strengthMutation.mutateAsync({ rows: rowsToSave });
    setHasUnsavedChanges(false);
    toast.success("Subject mapping strengths saved.");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="max-w-sm min-w-[200px]">
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search course outcomes..."
            value={search}
            onChange={(e) => void setSearch(e.target.value || null)}
          />
        </InputGroup>
        <CreateCourseOutcomeSheet subjectId={subjectId}>
          <Button>
            Add <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </CreateCourseOutcomeSheet>
      </div>
      {outcomesQuery.isLoading ? (
        <SpinnerPage />
      ) : (
        <DataTable data={visibleRows} columns={columns} />
      )}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">
              CO - PO/PSO Strength Mapping (Semester {semester})
            </h3>
            <p className="text-sm text-muted-foreground">
              Set 1 (Low), 2 (Medium), or 3 (High) for each mapping cell.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={!hasUnsavedChanges || strengthMutation.isPending}
            onClick={() => void handleSaveMappings()}
          >
            {strengthMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
        <div className="overflow-x-auto rounded-md border">
          {isStrengthLoading || programOutcomesQuery.isLoading ? (
            <div className="p-4">
              <SpinnerPage />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No course outcomes found for this subject.
            </div>
          ) : mappingOutcomes.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No program outcomes available for mapping.
            </div>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-2 text-left font-semibold">
                    Course Outcomes
                  </th>
                  {mappingOutcomes.map((outcome) => (
                    <th
                      key={outcome.id}
                      className="border p-2 text-center font-semibold"
                    >
                      {outcome.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((co) => (
                  <tr key={co.id}>
                    <td className="border p-2 font-medium">{co.name}</td>
                    {mappingOutcomes.map((outcome) => {
                      const value =
                        matrixSelections[`${co.id}:${outcome.id}`] ?? "";
                      return (
                        <td key={outcome.id} className="border p-2 text-center">
                          <Select
                            value={value}
                            onValueChange={(next) =>
                              setMatrixStrength(co.id, outcome.id, next)
                            }
                          >
                            <SelectTrigger className="mx-auto h-8 w-20 rounded-md">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
