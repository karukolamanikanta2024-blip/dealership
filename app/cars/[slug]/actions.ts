"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { pickConsultant } from "@/lib/assign-lead";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(500).optional(),
  consent: z.literal("on"),
  variantSlug: z.string().regex(/^[a-z0-9-]+$/).max(100),
  cityName: z.string().min(1).max(60),
  modelSlug: z.string().regex(/^[a-z0-9-]+$/).max(100),
});

export async function submitEnquiry(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const modelSlug =
    typeof raw.modelSlug === "string" && /^[a-z0-9-]+$/.test(raw.modelSlug) ? raw.modelSlug : null;
  const back = modelSlug ? `/cars/${modelSlug}` : "/";

  const parsed = schema.safeParse(raw);
  if (!parsed.success) redirect(`${back}?error=invalid#enquiry`);
  const data = parsed.data;

  const variant = await prisma.variant.findUnique({ where: { slug: data.variantSlug } });
  if (!variant) redirect(`${back}?error=invalid#enquiry`);

  const city = await prisma.city.findFirst({
    where: { name: { equals: data.cityName, mode: "insensitive" } },
  });

  let showrooms = await prisma.showroom.findMany({
    where: city ? { cityId: city.id } : {},
    orderBy: { id: "asc" },
  });
  if (showrooms.length === 0) showrooms = await prisma.showroom.findMany({ orderBy: { id: "asc" } });
  if (showrooms.length === 0) redirect(`${back}?error=invalid#enquiry`);

  const rules = await prisma.assignmentRule.findMany({
    where: { showroomId: { in: showrooms.map((s) => s.id) } },
  });

  // Pick the first showroom in the city that has a consultant for this model
  let showroomId = showrooms[0].id;
  let consultantId: number | null = null;
  for (const s of showrooms) {
    const c = pickConsultant(rules, s.id, variant.modelId);
    if (c !== null) {
      showroomId = s.id;
      consultantId = c;
      break;
    }
  }

    // Ignore a repeat of the same enquiry within 10 minutes (double click or refresh)
  const recent = await prisma.lead.findFirst({
    where: {
      phone: data.phone,
      variantId: variant.id,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });
  if (recent) redirect(`${back}?enquiry=sent#enquiry`);
  await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      message: data.message || null,
      source: "WEBSITE",
      status: "NEW",
      consent: true,
      respondBy: new Date(Date.now() + 5 * 60 * 1000),
      showroomId,
      assignedToId: consultantId,
      variantId: variant.id,
    },
  });

  redirect(`${back}?enquiry=sent#enquiry`);
}