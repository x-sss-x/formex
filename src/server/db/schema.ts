import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ─────────────────────────────────────────
   ENUMS
───────────────────────────────────────── */

export const sessionEnum = pgEnum("session", ["morning", "afternoon"]);

export const calendarTypeEnum = pgEnum("calendar_type", [
  "institution", // INS-FORMAT-3
  "program",     // INS-FORMAT-4
]);

/* ─────────────────────────────────────────
   INSTITUTIONS
   (was empty before — added proper fields)
───────────────────────────────────────── */

export const institutions = pgTable("institutions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  email: text("email"),
  phone: text("phone"),
  logoUrl: text("logo_url"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/* ─────────────────────────────────────────
   BRANCHES
   (was empty before — added name + FK to institution)
───────────────────────────────────────── */

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/* ─────────────────────────────────────────
   DEPARTMENTS
   (was empty before — added name + FK to branch)
───────────────────────────────────────── */

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/* ─────────────────────────────────────────
   ACADEMIC CALENDARS
   (added formNo, revision, headerDate — rest unchanged)
───────────────────────────────────────── */

export const academicCalendars = pgTable("academic_calendars", {
  id: uuid("id").defaultRandom().primaryKey(),

  // FK relations — unchanged from original
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  branchId: uuid("branch_id").references(() => branches.id),
  departmentId: uuid("department_id").references(() => departments.id),

  // Original field — unchanged
  academicYear: text("academic_year").notNull(),
  calendarType: calendarTypeEnum("calendar_type").notNull(),

  // NEW fields needed for the print header
  formNo: text("form_no"),
  revision: text("revision"),
  headerDate: text("header_date"), // "date" is reserved in some DBs, renamed
  totalWeeks: integer("total_weeks").notNull().default(4),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/* ─────────────────────────────────────────
   CALENDAR EVENTS
   (merged morning+afternoon into one row per day — cleaner)
   Day name added so we don't have to recalculate from date
───────────────────────────────────────── */

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // FK — unchanged
    calendarId: uuid("calendar_id")
      .notNull()
      .references(() => academicCalendars.id, { onDelete: "cascade" }),

    weekNumber: integer("week_number").notNull(),
    dayName: text("day_name").notNull(),   // "Monday", "Tuesday" etc.
    date: date("date"),                    // optional — user fills manually

    // Both sessions in one row (simpler for form binding)
    morningActivity: text("morning_activity"),
    afternoonActivity: text("afternoon_activity"),
  },
  (table) => ({
    // One row per (calendar, week, day)
    uniqueDayPerWeek: uniqueIndex("unique_day_per_week").on(
      table.calendarId,
      table.weekNumber,
      table.dayName
    ),
  })
);

/* ─────────────────────────────────────────
   EQUIPMENT FORMAT ENUM
   INS-FORMAT-H33 (Aided/Private) vs INS-FORMAT-33 (Govt)
───────────────────────────────────────── */

export const equipmentFormatEnum = pgEnum("equipment_format", [
  "H33", // INS-FORMAT-H33
  "33",  // INS-FORMAT-33
])

export const workingStatusEnum = pgEnum("working_status", [
  "working",
  "not_working",
])

/* ─────────────────────────────────────────
   EQUIPMENT STATEMENTS
   One statement = one INS-FORMAT-H33 / INS-FORMAT-33 document
───────────────────────────────────────── */

export const equipmentStatements = pgTable("equipment_statements", {
  id: uuid("id").defaultRandom().primaryKey(),

  // FK — institution / branch / department
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  branchId: uuid("branch_id").references(() => branches.id),
  departmentId: uuid("department_id").references(() => departments.id),

  // Meta fields shown on print
  program: text("program").notNull(),        // auto-filled from branch name
  semester: text("semester").notNull(),
  academicYear: text("academic_year").notNull(),
  labWorkshop: text("lab_workshop").notNull(),

  // Format type
  formatType: equipmentFormatEnum("format_type").notNull().default("H33"),

  // Print header fields
  formNo: text("form_no"),
  revision: text("revision"),
  headerDate: text("header_date"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

/* ─────────────────────────────────────────
   EQUIPMENT ITEMS
   Each row in the equipment table
───────────────────────────────────────── */

export const equipmentItems = pgTable("equipment_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  statementId: uuid("statement_id")
    .notNull()
    .references(() => equipmentStatements.id, { onDelete: "cascade" }),

  slNo: integer("sl_no").notNull(),                          // Sl. No.
  name: text("name").notNull(),                              // Name of instrument/Equipment/Machine
  qtyAsSyllabus: text("qty_as_syllabus"),                   // Quantity as per syllabus
  qtyAvailable: text("qty_available"),                      // Quantity actually available
  dateOfPurchase: date("date_of_purchase"),                  // Date of purchase
  workingStatus: workingStatusEnum("working_status"),        // Working / Not Working
  reasonsNotWorking: text("reasons_not_working"),            // Reasons for not working
  remarks: text("remarks"),                                  // Remarks

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

/* ─────────────────────────────────────────
   TEMPLATE  (unchanged — kept as-is)
───────────────────────────────────────── */

export const template = pgTable("template", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  title: d.text().notNull(),
  stateJSON: d.jsonb().default([]),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

/* ─────────────────────────────────────────
   STUDENT  (unchanged — kept as-is)
───────────────────────────────────────── */

export const student = pgTable("student", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  fullName: d.text().notNull(),
  dateOfBirth: d.date().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));