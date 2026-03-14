import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { departments } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"

export const departmentRouter = createRouter({

  getByBranch: publicProcedure
    .input(z.object({ branchId: z.string() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(departments)
        .where(eq(departments.branchId, input.branchId))
        .orderBy(departments.name)
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        branchId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.insert(departments).values(input).returning()
      return result[0]
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db
        .update(departments)
        .set(data)
        .where(eq(departments.id, id))
        .returning()
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.delete(departments).where(eq(departments.id, input.id))
    }),
})