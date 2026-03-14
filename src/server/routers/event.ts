import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { calendarEvents } from "../db/schema"
import { db } from "../db"
import { eq, and } from "drizzle-orm"

export const eventRouter = createRouter({

  // ── Get all events for a calendar ──
  getByCalendar: publicProcedure
    .input(z.object({ calendarId: z.string() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.calendarId, input.calendarId))
        .orderBy(calendarEvents.weekNumber)
    }),

  // ── Upsert a single day row ──
  upsertDay: publicProcedure
    .input(
      z.object({
        calendarId: z.string(),
        weekNumber: z.number(),
        dayName: z.string(),
        date: z.string().optional().nullable(),
        morningActivity: z.string().optional().nullable(),
        afternoonActivity: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if row exists
      const existing = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.calendarId, input.calendarId),
            eq(calendarEvents.weekNumber, input.weekNumber),
            eq(calendarEvents.dayName, input.dayName)
          )
        )

      if (existing.length > 0) {
        return db
          .update(calendarEvents)
          .set({
            date: input.date ?? null,
            morningActivity: input.morningActivity ?? null,
            afternoonActivity: input.afternoonActivity ?? null,
          })
          .where(eq(calendarEvents.id, existing[0]!.id))
          .returning()
      }

      return db
        .insert(calendarEvents)
        .values({
          calendarId: input.calendarId,
          weekNumber: input.weekNumber,
          dayName: input.dayName,
          date: input.date ?? null,
          morningActivity: input.morningActivity ?? null,
          afternoonActivity: input.afternoonActivity ?? null,
        })
        .returning()
    }),

  // ── Bulk upsert — save all events at once ──
  bulkUpsert: publicProcedure
    .input(
      z.object({
        calendarId: z.string(),
        events: z.array(
          z.object({
            weekNumber: z.number(),
            dayName: z.string(),
            date: z.string().optional().nullable(),
            morningActivity: z.string().optional().nullable(),
            afternoonActivity: z.string().optional().nullable(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      // Delete existing events and re-insert (cleanest bulk upsert for SQLite/Postgres)
      await db
        .delete(calendarEvents)
        .where(eq(calendarEvents.calendarId, input.calendarId))

      if (input.events.length === 0) return []

      return db
        .insert(calendarEvents)
        .values(
          input.events.map((e) => ({
            calendarId: input.calendarId,
            weekNumber: e.weekNumber,
            dayName: e.dayName,
            date: e.date ?? null,
            morningActivity: e.morningActivity ?? null,
            afternoonActivity: e.afternoonActivity ?? null,
          }))
        )
        .returning()
    }),

  // ── Delete single event row ──
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db
        .delete(calendarEvents)
        .where(eq(calendarEvents.id, input.id))
    }),
})