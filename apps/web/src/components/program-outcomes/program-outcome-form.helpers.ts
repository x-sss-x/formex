import type { ProgramOutcome } from "@/lib/api/generated/models";
import { z } from "zod";

export const PROGRAM_OUTCOME_TYPES = [
  "program_outcome",
  "program_specific_outcome",
  "program_educational_objectives",
] as const;

export const PROGRAM_OUTCOME_TYPE_LABELS: Record<string, string> = {
  program_outcome: "PO",
  program_specific_outcome: "PSO",
  program_educational_objectives: "PEO",
};

export const ProgramOutcomeFormSchema = z.object({
  type: z.enum(PROGRAM_OUTCOME_TYPES),
  name: z.string().max(255),
  description: z.string().nullable().optional(),
  syllabus_scheme: z.string().nullable().optional(),
});

export type ProgramOutcomeFormValues = z.infer<typeof ProgramOutcomeFormSchema>;

export function programOutcomeCreateDefaults(): ProgramOutcomeFormValues {
  return {
    type: "program_outcome",
    name: "",
    description: "",
    syllabus_scheme: "",
  };
}

export function programOutcomeToFormValues(
  outcome: ProgramOutcome,
): ProgramOutcomeFormValues {
  return {
    type: (PROGRAM_OUTCOME_TYPES.includes(
      outcome.type as (typeof PROGRAM_OUTCOME_TYPES)[number],
    )
      ? outcome.type
      : "program_outcome") as ProgramOutcomeFormValues["type"],
    name: outcome.name,
    description: outcome.description ?? "",
    syllabus_scheme: outcome.syllabus_scheme ?? "",
  };
}
