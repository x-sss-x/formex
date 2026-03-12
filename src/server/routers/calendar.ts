import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { academicCalendars } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export const calendarRouter = createRouter({

  create: publicProcedure
    .input(
      z.object({
        institutionId: z.string(),
        branchId: z.string().nullable(),
        departmentId: z.string().nullable(),
        academicYear: z.string(),
        calendarType: z.enum(["institution", "program"]),
      })
    )
    .mutation(async ({ input }) => {
      const calendar = await db.insert(academicCalendars).values({
        institutionId: input.institutionId,
        branchId: input.branchId ?? null,
        departmentId: input.departmentId ?? null,
        academicYear: input.academicYear,
        calendarType: input.calendarType,
      }).returning();

      return calendar;
    }),

  getAll: publicProcedure.query(async () => {
    return db.select().from(academicCalendars);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(academicCalendars)
        .where(eq(academicCalendars.id, input.id));
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        academicYear: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return db
        .update(academicCalendars)
        .set({
          academicYear: input.academicYear,
        })
        .where(eq(academicCalendars.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db
        .delete(academicCalendars)
        .where(eq(academicCalendars.id, input.id));
    }),

});