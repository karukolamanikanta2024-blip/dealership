"use server";

import { revalidatePath } from "next/cache";
import { generateDraft } from "@/lib/ai-draft";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const schema = z.object({
  leadId: z.coerce.number().int().positive(),
  status: z.enum(["CONTACTED", "WON", "LOST"]),
});

export async function updateLeadStatus(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { leadId, status } = parsed.data;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;
  if (session.role !== "ADMIN" && lead.assignedToId !== session.userId) return;

  await prisma.lead.update({
    where: { id: leadId },
    data: { status, firstResponseAt: lead.firstResponseAt ?? new Date() },
  });
  revalidatePath("/inbox");
}

export async function draftWithAI(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const parsed = z.object({ leadId: z.coerce.number().int().positive() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const lead = await prisma.lead.findUnique({
    where: { id: parsed.data.leadId },
    include: { variant: { include: { model: true } }, usedCar: true, showroom: true, assignedTo: true },
  });
  if (!lead) return;
  if (session.role !== "ADMIN" && lead.assignedToId !== session.userId) return;

  const car = lead.variant
    ? `${lead.variant.model.name} ${lead.variant.name}`
    : lead.usedCar
      ? `${lead.usedCar.year} ${lead.usedCar.modelName} ${lead.usedCar.variantName} (used)`
      : null;

  const draft = await generateDraft({
    name: lead.name,
    message: lead.message,
    source: lead.source,
    car,
    showroom: lead.showroom.name,
    consultant: lead.assignedTo?.name ?? null,
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { aiSummary: draft.summary, aiReplyDraft: draft.reply, aiDraftSource: draft.source },
  });
  revalidatePath("/inbox");
}