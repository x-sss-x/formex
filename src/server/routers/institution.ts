import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { institutions } from "../db/schema"
import { eq } from "drizzle-orm"

export const institutionRouter = createRouter({

  getAll: publicProcedure.query(({ ctx }) =>
    ctx.db.select().from(institutions).orderBy(institutions.name)
  ),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db
        .select()
        .from(institutions)
        .where(eq(institutions.id, input.id))
        .then((rows) => rows[0] ?? null)
    ),

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
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(institutions)
        .values(input)
        .returning()
        .then((rows) => rows[0])
    ),

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
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db
        .update(institutions)
        .set(data)
        .where(eq(institutions.id, id))
        .returning()
        .then((rows) => rows[0])
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(institutions).where(eq(institutions.id, input.id))
    ),
})