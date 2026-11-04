"use server";

import { revalidatePath } from "next/cache";
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