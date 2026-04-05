export function getProgramsStudentsQueryKey(programId: string) {
  return ["programsStudents", programId] as const;
}

/** HTML `type="date"` value from API / form ISO datetime. */
export function dateInputValueFromIso(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/** Zod `iso.datetime` expects a full ISO string; date inputs yield `YYYY-MM-DD`. */
export function isoFromDateInput(date: string): string | undefined {
  if (!date.trim()) return undefined;
  return new Date(`${date}T12:00:00`).toISOString();
}
