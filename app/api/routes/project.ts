import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { projects } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

export const projectRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id));
      return result[0] ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        chainLevel: z.string().optional(),
        fundingStage: z.string().optional(),
        teamBackground: z.string().optional(),
        coreTech: z.string().optional(),
        teamSize: z.number().optional(),
        patents: z.number().optional(),
        trl: z.number().optional(),
        mrl: z.number().optional(),
        tam: z.string().optional(),
        sam: z.string().optional(),
        som: z.string().optional(),
        differentiation: z.string().optional(),
        competitors: z.string().optional(),
        payingCustomers: z.string().optional(),
        fundDirections: z.array(z.string()).optional(),
        instituteCapabilities: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(projects).values({
        name: input.name,
        description: input.description,
        chainLevel: input.chainLevel,
        fundingStage: input.fundingStage,
        teamBackground: input.teamBackground,
        coreTech: input.coreTech,
        teamSize: input.teamSize,
        patents: input.patents,
        trl: input.trl,
        mrl: input.mrl,
        tam: input.tam ? input.tam : undefined,
        sam: input.sam ? input.sam : undefined,
        som: input.som ? input.som : undefined,
        differentiation: input.differentiation,
        competitors: input.competitors,
        payingCustomers: input.payingCustomers,
        fundDirections: input.fundDirections,
        instituteCapabilities: input.instituteCapabilities,
        status: "draft",
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        chainLevel: z.string().optional(),
        fundingStage: z.string().optional(),
        teamBackground: z.string().optional(),
        coreTech: z.string().optional(),
        teamSize: z.number().optional(),
        patents: z.number().optional(),
        trl: z.number().optional(),
        mrl: z.number().optional(),
        tam: z.string().optional(),
        sam: z.string().optional(),
        som: z.string().optional(),
        differentiation: z.string().optional(),
        competitors: z.string().optional(),
        payingCustomers: z.string().optional(),
        fundDirections: z.array(z.string()).optional(),
        instituteCapabilities: z.array(z.string()).optional(),
        overallScore: z.string().optional(),
        rating: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(projects).set(data).where(eq(projects.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),
});
