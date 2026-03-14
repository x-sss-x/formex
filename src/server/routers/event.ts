import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { calendarEvents } from "../db/schema"
import { eq, and } from "drizzle-orm"

export const eventRouter = createRouter({

  getByCalendar: publicProcedure
    .input(z.object({ calendarId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.calendarId, input.calendarId))
        .orderBy(calendarEvents.weekNumber)
    ),

  bulkUpsert: publicProcedure
    .input(
      z.object({
        calendarId: z.string(),
        events: z.array(
          z.object({
            weekNumber: z.number(),
            dayName: z.string(),
            date: z.string().nullable().optional(),
            morningActivity: z.string().nullable().optional(),
            afternoonActivity: z.string().nullable().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(calendarEvents)
        .where(eq(calendarEvents.calendarId, input.calendarId))

      if (input.events.length === 0) return []

      return ctx.db
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

  upsertDay: publicProcedure
    .input(
      z.object({
        calendarId: z.string(),
        weekNumber: z.number(),
        dayName: z.string(),
        date: z.string().nullable().optional(),
        morningActivity: z.string().nullable().optional(),
        afternoonActivity: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
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
        return ctx.db
          .update(calendarEvents)
          .set({
            date: input.date ?? null,
            morningActivity: input.morningActivity ?? null,
            afternoonActivity: input.afternoonActivity ?? null,
          })
          .where(eq(calendarEvents.id, existing[0]!.id))
          .returning()
      }

      return ctx.db
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

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .delete(calendarEvents)
        .where(eq(calendarEvents.id, input.id))
    ),
})