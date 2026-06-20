import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { aiChatLogs } from "../../db/schema";
import { eq } from "drizzle-orm";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT = `你是「智源嘉创」科技服务平台的AI科创助手，专门为科技企业提供全生命周期一站式服务咨询。

你的核心能力包括：
1. **服务咨询**：解答关于9大服务模块的问题（研发管理、知识产权、资质培育、资本路径、产学研、法律风控、AI转型、算力服务、ZETA-Score评价）
2. **政策解读**：解读科技金融、高企认定、专精特新、研发加计扣除等政策
3. **方案推荐**：根据企业情况推荐适合的服务方案
4. **企业诊断**：初步评估企业发展阶段和痛点

服务定价参考：
- 种子期启航包：2-5万元（法律+知识产权+财务基础+政策导航）
- 天使期加速包：8-15万元（+高企认定+贯标+融资BP+治理升级）
- Pre-A跃迁包：15-30万元（+专精特新+政府基金+财务合规深度）
- A轮冲刺包：30-60万元（+上市预备+国际专利+CVC对接）

沟通风格：专业、亲切、有洞察力。用中文回答。`;

async function callDeepSeek(messages: any[]) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json() as { choices: [{ message: { content: string } }] };
  return data.choices[0].message.content;
}

export const aiAssistantRouter = createRouter({
  chat: publicQuery
    .input(z.object({
      sessionId: z.string(),
      message: z.string().min(1),
      history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // Save user message
      await db.insert(aiChatLogs).values({
        sessionId: input.sessionId,
        role: "user",
        content: input.message,
      });

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...(input.history || []).map(h => ({ role: h.role === "assistant" ? "assistant" as const : "user" as const, content: h.content })),
        { role: "user" as const, content: input.message },
      ];

      const reply = await callDeepSeek(messages);

      // Save assistant message
      await db.insert(aiChatLogs).values({
        sessionId: input.sessionId,
        role: "assistant",
        content: reply,
      });

      return { reply };
    }),

  getHistory: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(aiChatLogs)
        .where(eq(aiChatLogs.sessionId, input.sessionId))
        .orderBy(aiChatLogs.createdAt);
    }),
});
