import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { branches } from "../db/schema"
import { eq } from "drizzle-orm"

export const branchRouter = createRouter({

  getByInstitution: publicProcedure
    .input(z.object({ institutionId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db
        .select()
        .from(branches)
        .where(eq(branches.institutionId, input.institutionId))
        .orderBy(branches.name)
    ),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), institutionId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(branches)
        .values(input)
        .returning()
        .then((rows) => rows[0])
    ),

  update: publicProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(branches)
        .set({ name: input.name })
        .where(eq(branches.id, input.id))
        .returning()
        .then((rows) => rows[0])
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(branches).where(eq(branches.id, input.id))
    ),
})