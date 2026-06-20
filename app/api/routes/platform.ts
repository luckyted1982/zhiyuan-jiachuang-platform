import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { platformCompanies, serviceOrders, knowledgeBase, partners } from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const platformRouter = createRouter({
  // 企业CRUD
  companyList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(platformCompanies).orderBy(desc(platformCompanies.createdAt));
  }),
  companyCreate: publicQuery
    .input(z.object({
      name: z.string().min(1),
      industry: z.string().optional(),
      stage: z.string().optional(),
      scale: z.string().optional(),
      contact: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      requirements: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(platformCompanies).values(input);
      return { id: Number(result[0].insertId) };
    }),
  companyUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      industry: z.string().optional(),
      stage: z.string().optional(),
      scale: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(platformCompanies).set(data).where(eq(platformCompanies.id, id));
      return { success: true };
    }),

  // 服务订单
  orderList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt));
  }),
  orderCreate: publicQuery
    .input(z.object({
      companyId: z.number(),
      serviceModule: z.string().min(1),
      serviceItem: z.string().min(1),
      description: z.string().optional(),
      assignedTo: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(serviceOrders).values(input);
      return { success: true };
    }),
  orderUpdateStatus: publicQuery
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(serviceOrders).set({ status: input.status }).where(eq(serviceOrders.id, input.id));
      return { success: true };
    }),

  // 知识库
  kbList: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.category) {
        return db.select().from(knowledgeBase).where(eq(knowledgeBase.category, input.category)).orderBy(desc(knowledgeBase.createdAt));
      }
      return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.createdAt));
    }),
  kbCreate: publicQuery
    .input(z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      tags: z.array(z.string()).optional(),
      content: z.string().min(1),
      author: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(knowledgeBase).values(input);
      return { success: true };
    }),
  kbIncrementView: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(knowledgeBase).set({ viewCount: sql`view_count + 1` }).where(eq(knowledgeBase.id, input.id));
      return { success: true };
    }),

  // 合作伙伴
  partnerList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(partners).orderBy(desc(partners.createdAt));
  }),
  partnerCreate: publicQuery
    .input(z.object({
      name: z.string().min(1),
      type: z.string().min(1),
      description: z.string().optional(),
      website: z.string().optional(),
      contactPerson: z.string().optional(),
      contactPhone: z.string().optional(),
      cooperationScope: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(partners).values(input);
      return { success: true };
    }),
});
