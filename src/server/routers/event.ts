import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { calendarEvents } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export const eventRouter = createRouter({

  create: publicProcedure
    .input(
      z.object({
        calendarId: z.string(),
        weekNumber: z.number(),
        date: z.string(),
        session: z.enum(["morning", "afternoon"]),
        activity: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      return db.insert(calendarEvents).values(input).returning();
    }),

  getByCalendar: publicProcedure
    .input(z.object({ calendarId: z.string() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.calendarId, input.calendarId));
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        activity: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return db
        .update(calendarEvents)
        .set({ activity: input.activity })
        .where(eq(calendarEvents.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db
        .delete(calendarEvents)
        .where(eq(calendarEvents.id, input.id));
    }),

});