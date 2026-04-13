"use client";

import type {
  SkillProgram,
  SkillProgramStoreBody,
  SkillProgramsUpdateBody,
} from "@/lib/api/generated/models";

function toDateTimeLocalInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function isoFromDateTimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

export function skillProgramCreateDefaults(): SkillProgramStoreBody {
  return {
    details: "",
    resource_person_name: "",
    company_name: "",
    designation: "",
    conducted_date: new Date().toISOString(),
    academic_year: new Date().getFullYear(),
  };
}

export function skillProgramUpdateDefaults(
  skillProgram: SkillProgram,
): SkillProgramsUpdateBody {
  return {
    details: skillProgram.details ?? "",
    resource_person_name: skillProgram.resource_person_name ?? "",
    company_name: skillProgram.company_name ?? "",
    designation: skillProgram.designation ?? "",
    conducted_date: skillProgram.conducted_date
      ? new Date(skillProgram.conducted_date).toISOString()
      : new Date().toISOString(),
    academic_year: Number(skillProgram.academic_year ?? new Date().getFullYear()),
  };
}

export { toDateTimeLocalInputValue };
