import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { departments } from "../db/schema"
import { eq } from "drizzle-orm"

export const departmentRouter = createRouter({

  getByBranch: publicProcedure
    .input(z.object({ branchId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db
        .select()
        .from(departments)
        .where(eq(departments.branchId, input.branchId))
        .orderBy(departments.name)
    ),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), branchId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(departments)
        .values(input)
        .returning()
        .then((rows) => rows[0])
    ),

  update: publicProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(departments)
        .set({ name: input.name })
        .where(eq(departments.id, input.id))
        .returning()
        .then((rows) => rows[0])
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(departments).where(eq(departments.id, input.id))
    ),
})