import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { institutions } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"

export const institutionRouter = createRouter({

  getAll: publicProcedure.query(async () => {
    return db.select().from(institutions).orderBy(institutions.name)
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(institutions)
        .where(eq(institutions.id, input.id))
      return result[0] ?? null
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        logoUrl: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .insert(institutions)
        .values(input)
        .returning()
      return result[0]
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        logoUrl: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db
        .update(institutions)
        .set(data)
        .where(eq(institutions.id, id))
        .returning()
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db
        .delete(institutions)
        .where(eq(institutions.id, input.id))
    }),
})