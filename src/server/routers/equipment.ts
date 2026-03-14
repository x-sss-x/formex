import { z } from "zod"
import { createRouter, publicProcedure } from "../trpc"
import {
  equipmentStatements,
  equipmentItems,
  institutions,
  branches,
  departments,
} from "../db/schema"
import { eq } from "drizzle-orm"

export const equipmentRouter = createRouter({

  getAll: publicProcedure.query(({ ctx }) =>
    ctx.db
      .select({
        id: equipmentStatements.id,
        program: equipmentStatements.program,
        semester: equipmentStatements.semester,
        academicYear: equipmentStatements.academicYear,
        labWorkshop: equipmentStatements.labWorkshop,
        formatType: equipmentStatements.formatType,
        formNo: equipmentStatements.formNo,
        createdAt: equipmentStatements.createdAt,
        institutionId: equipmentStatements.institutionId,
        institutionName: institutions.name,
        institutionCode: institutions.code,
        branchId: equipmentStatements.branchId,
        branchName: branches.name,
        departmentId: equipmentStatements.departmentId,
        departmentName: departments.name,
      })
      .from(equipmentStatements)
      .leftJoin(institutions, eq(equipmentStatements.institutionId, institutions.id))
      .leftJoin(branches, eq(equipmentStatements.branchId, branches.id))
      .leftJoin(departments, eq(equipmentStatements.departmentId, departments.id))
      .orderBy(equipmentStatements.createdAt)
  ),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          id: equipmentStatements.id,
          program: equipmentStatements.program,
          semester: equipmentStatements.semester,
          academicYear: equipmentStatements.academicYear,
          labWorkshop: equipmentStatements.labWorkshop,
          formatType: equipmentStatements.formatType,
          formNo: equipmentStatements.formNo,
          revision: equipmentStatements.revision,
          headerDate: equipmentStatements.headerDate,
          institutionId: equipmentStatements.institutionId,
          institutionName: institutions.name,
          institutionCode: institutions.code,
          institutionEmail: institutions.email,
          institutionPhone: institutions.phone,
          institutionLogoUrl: institutions.logoUrl,
          branchId: equipmentStatements.branchId,
          branchName: branches.name,
          departmentId: equipmentStatements.departmentId,
          departmentName: departments.name,
        })
        .from(equipmentStatements)
        .leftJoin(institutions, eq(equipmentStatements.institutionId, institutions.id))
        .leftJoin(branches, eq(equipmentStatements.branchId, branches.id))
        .leftJoin(departments, eq(equipmentStatements.departmentId, departments.id))
        .where(eq(equipmentStatements.id, input.id))

      const statement = rows[0]
      if (!statement) return null

      const items = await ctx.db
        .select()
        .from(equipmentItems)
        .where(eq(equipmentItems.statementId, input.id))
        .orderBy(equipmentItems.slNo)

      return { ...statement, items }
    }),

  create: publicProcedure
    .input(
      z.object({
        institutionId: z.string(),
        branchId: z.string().nullable().optional(),
        departmentId: z.string().nullable().optional(),
        program: z.string().min(1),
        semester: z.string().min(1),
        academicYear: z.string().min(1),
        labWorkshop: z.string().min(1),
        formatType: z.enum(["H33", "33"]),
        formNo: z.string().nullable().optional(),
        revision: z.string().nullable().optional(),
        headerDate: z.string().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .insert(equipmentStatements)
        .values({
          institutionId: input.institutionId,
          branchId: input.branchId ?? null,
          departmentId: input.departmentId ?? null,
          program: input.program,
          semester: input.semester,
          academicYear: input.academicYear,
          labWorkshop: input.labWorkshop,
          formatType: input.formatType,
          formNo: input.formNo ?? null,
          revision: input.revision ?? null,
          headerDate: input.headerDate ?? null,
        })
        .returning()
        .then((rows) => rows[0])
    ),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        program: z.string().optional(),
        semester: z.string().optional(),
        academicYear: z.string().optional(),
        labWorkshop: z.string().optional(),
        formatType: z.enum(["H33", "33"]).optional(),
        formNo: z.string().nullable().optional(),
        revision: z.string().nullable().optional(),
        headerDate: z.string().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db
        .update(equipmentStatements)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(equipmentStatements.id, id))
        .returning()
        .then((rows) => rows[0])
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db
        .delete(equipmentStatements)
        .where(eq(equipmentStatements.id, input.id))
    ),
})