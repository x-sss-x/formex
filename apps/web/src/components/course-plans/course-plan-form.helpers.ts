import type { CoursePlan } from "@/lib/api/generated/models";

function toIsoString(value: string): string {
  return value ? new Date(value).toISOString() : "";
}

export function toDateTimeLocalInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function isoFromDateTimeLocal(value: string): string {
  if (!value) {
    return "";
  }
  return toIsoString(value);
}

export function coursePlanDefaults() {
  return {
    course_coordinator_id: "",
    week_no: 1,
    topic_no: 1,
    planned_date: "",
    completed_date: null as string | null,
    teaching_aids: "",
    outcome: "",
    remarks: "",
  };
}

export function coursePlanToFormValues(coursePlan: CoursePlan) {
  return {
    course_coordinator_id: coursePlan.course_coordinator_id,
    week_no: Number(coursePlan.week_no || 1),
    topic_no: Number(coursePlan.topic_no || 1),
    planned_date: coursePlan.planned_date,
    completed_date: coursePlan.completed_date || null,
    teaching_aids: coursePlan.teaching_aids || "",
    outcome: coursePlan.outcome || "",
    remarks: coursePlan.remarks || "",
    academic_year: Number(coursePlan.academic_year || 0),
  };
}
