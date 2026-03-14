import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { branches } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"

export const branchRouter = createRouter({

  getByInstitution: publicProcedure
    .input(z.object({ institutionId: z.string() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(branches)
        .where(eq(branches.institutionId, input.institutionId))
        .orderBy(branches.name)
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        institutionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.insert(branches).values(input).returning()
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
        .update(branches)
        .set(data)
        .where(eq(branches.id, id))
        .returning()
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return db.delete(branches).where(eq(branches.id, input.id))
    }),
})