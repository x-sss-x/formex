import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import { equipmentItems } from "../db/schema"
import { eq } from "drizzle-orm"

export const equipmentItemRouter = createRouter({

  getByStatement: publicProcedure
    .input(z.object({ statementId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db
        .select()
        .from(equipmentItems)
        .where(eq(equipmentItems.statementId, input.statementId))
        .orderBy(equipmentItems.slNo)
    ),

  bulkSave: publicProcedure
    .input(
      z.object({
        statementId: z.string(),
        items: z.array(
          z.object({
            slNo: z.number(),
            name: z.string(),
            qtyAsSyllabus: z.string().nullable().optional(),
            qtyAvailable: z.string().nullable().optional(),
            dateOfPurchase: z.string().nullable().optional(),
            workingStatus: z.enum(["working", "not_working"]).nullable().optional(),
            reasonsNotWorking: z.string().nullable().optional(),
            remarks: z.string().nullable().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(equipmentItems)
        .where(eq(equipmentItems.statementId, input.statementId))

      if (input.items.length === 0) return []

      return ctx.db
        .insert(equipmentItems)
        .values(
          input.items.map((item) => ({
            statementId: input.statementId,
            slNo: item.slNo,
            name: item.name,
            qtyAsSyllabus: item.qtyAsSyllabus ?? null,
            qtyAvailable: item.qtyAvailable ?? null,
            dateOfPurchase: item.dateOfPurchase ?? null,
            workingStatus: item.workingStatus ?? null,
            reasonsNotWorking: item.reasonsNotWorking ?? null,
            remarks: item.remarks ?? null,
          }))
        )
        .returning()
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .delete(equipmentItems)
        .where(eq(equipmentItems.id, input.id))
    ),
})