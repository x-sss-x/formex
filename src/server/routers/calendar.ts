import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { academicCalendars, calendarEvents, institutions, branches, departments } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"

export const calendarRouter = createRouter({

  // ── List all calendars with joined institution/branch/department names ──
  getAll: publicProcedure.query(async () => {
    const rows = await db
      .select({
        id: academicCalendars.id,
        academicYear: academicCalendars.academicYear,
        calendarType: academicCalendars.calendarType,
        formNo: academicCalendars.formNo,
        totalWeeks: academicCalendars.totalWeeks,
        createdAt: academicCalendars.createdAt,
        institutionId: academicCalendars.institutionId,
        institutionName: institutions.name,
        institutionCode: institutions.code,
        branchId: academicCalendars.branchId,
        branchName: branches.name,
        departmentId: academicCalendars.departmentId,
        departmentName: departments.name,
      })
      .from(academicCalendars)
      .leftJoin(institutions, eq(academicCalendars.institutionId, institutions.id))
      .leftJoin(branches, eq(academicCalendars.branchId, branches.id))
      .leftJoin(departments, eq(academicCalendars.departmentId, departments.id))
      .orderBy(academicCalendars.createdAt)

    return rows
  }),

  // ── Get single calendar with full details + events ──
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const calRows = await db
        .select({
          id: academicCalendars.id,
          academicYear: academicCalendars.academicYear,
          calendarType: academicCalendars.calendarType,
          formNo: academicCalendars.formNo,
          revision: academicCalendars.revision,
          headerDate: academicCalendars.headerDate,
          totalWeeks: academicCalendars.totalWeeks,
          institutionId: academicCalendars.institutionId,
          institutionName: institutions.name,
          institutionCode: institutions.code,
          institutionEmail: institutions.email,
          institutionPhone: institutions.phone,
          institutionLogoUrl: institutions.logoUrl,
          branchId: academicCalendars.branchId,
          branchName: branches.name,
          departmentId: academicCalendars.departmentId,
          departmentName: departments.name,
        })
        .from(academicCalendars)
        .leftJoin(institutions, eq(academicCalendars.institutionId, institutions.id))
        .leftJoin(branches, eq(academicCalendars.branchId, branches.id))
        .leftJoin(departments, eq(academicCalendars.departmentId, departments.id))
        .where(eq(academicCalendars.id, input.id))

      const cal = calRows[0]
      if (!cal) return null

      const events = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.calendarId, input.id))
        .orderBy(calendarEvents.weekNumber)

      return { ...cal, events }
    }),

  // ── Create calendar (Step 1 save) ──
  create: publicProcedure
    .input(
      z.object({
        institutionId: z.string(),
        branchId: z.string().nullable().optional(),
        departmentId: z.string().nullable().optional(),
        academicYear: z.string().min(1),
        calendarType: z.enum(["institution", "program"]),
        formNo: z.string().optional().nullable(),
        revision: z.string().optional().nullable(),
        headerDate: z.string().optional().nullable(),
        totalWeeks: z.number().min(1).max(52),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .insert(academicCalendars)
        .values({
          institutionId: input.institutionId,
          branchId: input.branchId ?? null,
          departmentId: input.departmentId ?? null,
          academicYear: input.academicYear,
          calendarType: input.calendarType,
          formNo: input.formNo ?? null,
          revision: input.revision ?? null,
          headerDate: input.headerDate ?? null,
          totalWeeks: input.totalWeeks,
        })
        .returning()

      return result[0]
    }),

  // ── Update calendar meta ──
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        academicYear: z.string().optional(),
        formNo: z.string().optional().nullable(),
        revision: z.string().optional().nullable(),
        headerDate: z.string().optional().nullable(),
        totalWeeks: z.number().min(1).max(52).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db
        .update(academicCalendars)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(academicCalendars.id, id))
        .returning()
    }),

  // ── Delete calendar (cascades to events) ──
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db
        .delete(academicCalendars)
        .where(eq(academicCalendars.id, input.id))
    }),
})