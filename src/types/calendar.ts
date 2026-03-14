/* ─────────────────────────────────────────
   REFERENCE DATA TYPES (from DB dropdowns)
───────────────────────────────────────── */

export type Institution = {
  id: string
  name: string
  code: string
  email?: string | null
  phone?: string | null
  logoUrl?: string | null
}

export type Branch = {
  id: string
  name: string
  institutionId: string
}

export type Department = {
  id: string
  name: string
  branchId: string
}

/* ─────────────────────────────────────────
   CALENDAR META
   Used for the print header & DB storage
───────────────────────────────────────── */

export type CalendarMeta = {
  // Step 1 — selections (IDs for DB, names for display)
  institutionId: string
  institutionName: string
  institutionCode: string
  branchId?: string | null
  branchName?: string | null
  departmentId?: string | null
  departmentName?: string | null

  // Header fields
  academicYear: string
  calendarType: "institution" | "program"
  formNo: string
  revision: string
  headerDate: string
  totalWeeks: number

  // From institution record
  email?: string | null
  phone?: string | null
  logoUrl?: string | null
}

/* ─────────────────────────────────────────
   CALENDAR EVENT (one row = one day)
───────────────────────────────────────── */

export type CalendarEvent = {
  id?: string          // undefined when not yet saved
  calendarId?: string
  weekNumber: number
  dayName: string      // "Monday" … "Sunday"
  date: string         // user fills manually
  morningActivity: string
  afternoonActivity: string
}

/* ─────────────────────────────────────────
   FORMAT TEMPLATE DEFINITION
   Used to register pre-defined formats
───────────────────────────────────────── */

export type CalendarFormatTemplate = {
  id: "institution" | "program"
  label: string
  formatCode: string   // "INS-FORMAT-3", "INS-FORMAT-4" etc.
  title: string        // "Academic Calendar of the Institution"
  signatureLeft?: string
  signatureRight: string
  note: string
}

/* ─────────────────────────────────────────
   PRE-DEFINED FORMAT TEMPLATES
───────────────────────────────────────── */

export const CALENDAR_FORMATS: CalendarFormatTemplate[] = [
  {
    id: "institution",
    label: "Institution Calendar (FORMAT-3)",
    formatCode: "INS-FORMAT-3",
    title: "Academic Calendar of the Institution",
    signatureRight: "Signature of the Principal with Seal",
    note: "All the Co-Curricular (Including Curriculum gap), Extra Curricular activities for odd & even Semester are to be planned at the commencement the academic year in line with the BTE academic calendar of events.",
  },
  {
    id: "program",
    label: "Program Calendar (FORMAT-4)",
    formatCode: "INS-FORMAT-4",
    title: "Academic Calendar of the Program",
    signatureLeft: "Signature of the HOD & Seal",
    signatureRight: "Signature of the Principal with Seal",
    note: "All the Co-Curricular (Including Curriculum gap), Extra Curricular activities for odd & even Semester are to be planned at the commencement the academic year in line with Institution academic calendar of events.",
  },
]

/* ─────────────────────────────────────────
   DAYS CONSTANT
───────────────────────────────────────── */

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const