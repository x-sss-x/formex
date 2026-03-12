import { sql } from "drizzle-orm";
import { pgTable, uuid, text, integer, date, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

/* ENUMS */

export const sessionEnum = pgEnum("session", ["morning", "afternoon"]);

export const calendarTypeEnum = pgEnum("calendar_type", [
  "institution",
  "program",
]);

/* REFERENCE TABLES */

export const institutions = pgTable("institutions", {
  id: uuid("id").defaultRandom().primaryKey(),
});

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
});

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
});

/* ACADEMIC CALENDAR */

export const academicCalendars = pgTable("academic_calendars", {
  id: uuid("id").defaultRandom().primaryKey(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  branchId: uuid("branch_id").references(() => branches.id),
  departmentId: uuid("department_id").references(() => departments.id),
  academicYear: text("academic_year").notNull(),
  calendarType: calendarTypeEnum("calendar_type").notNull(),
});

/* CALENDAR EVENTS */

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    calendarId: uuid("calendar_id")
      .notNull()
      .references(() => academicCalendars.id),
    weekNumber: integer("week_number").notNull(),
    date: date("date").notNull(),
    session: sessionEnum("session").notNull(),
    activity: text("activity"),
  },
  (table) => ({
    uniqueSessionPerDay: uniqueIndex("unique_session_per_day").on(
      table.calendarId,
      table.date,
      table.session
    ),
  })
);


/*------------------------------------------------------------------------*/

export const template = pgTable("template", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  title: d.text().notNull(),
  stateJSON: d.jsonb().default([]),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

export const student = pgTable("student", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  fullName: d.text().notNull(),
  dateOfBirth: d.date().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));
