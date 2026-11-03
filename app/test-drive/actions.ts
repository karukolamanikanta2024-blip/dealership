"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isValidSlot, formatSlot } from "@/lib/slots";
import { pickConsultant } from "@/lib/assign-lead";

const BACK_PATTERN = /^\/test-drive\?[a-zA-Z0-9=&_.-]*$/;

const schema = z
  .object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/),
    consent: z.literal("on"),
    slot: z.string().datetime(),
    demoCarId: z.coerce.number().int().positive().optional(),
    usedCarId: z.coerce.number().int().positive().optional(),
  })
  .refine((d) => Boolean(d.demoCarId) !== Boolean(d.usedCarId));

function fail(back: string, code: string): never {
  redirect(`${back}${back.includes("?") ? "&" : "?"}error=${code}`);
}

export async function bookTestDrive(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const backRaw = typeof raw.back === "string" ? raw.back : "";
  const back = BACK_PATTERN.test(backRaw) ? backRaw : "/";

  const parsed = schema.safeParse(raw);
  if (!parsed.success) fail(back, "invalid");
  const data = parsed.data;

  const slot = new Date(data.slot);
  if (!isValidSlot(slot)) fail(back, "invalid");

  let showroomId: number;
  let modelId: number | null = null;
  let variantId: number | null = null;

  if (data.demoCarId) {
    const demo = await prisma.demoCar.findUnique({
      where: { id: data.demoCarId },
      include: { variant: true },
    });
    if (!demo) fail(back, "invalid");
    showroomId = demo.showroomId;
    modelId = demo.variant.modelId;
    variantId = demo.variantId;
  } else {
    const used = await prisma.usedCar.findUnique({ where: { id: data.usedCarId! } });
    if (!used || used.status !== "AVAILABLE") fail(back, "unavailable");
    showroomId = used.showroomId;
    const model = await prisma.carModel.findFirst({ where: { name: used.modelName } });
    modelId = model ? model.id : null;
  }

  const rules = await prisma.assignmentRule.findMany({ where: { showroomId } });
  const consultantId = pickConsultant(rules, showroomId, modelId);

  let testDriveId: number;
  try {
    // One nested create: the booking and its lead are saved together or not at all
   const created = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          name: data.name,
          phone: data.phone,
          message: `Test drive booked for ${formatSlot(slot)}`,
          source: "TEST_DRIVE",
          status: "TEST_DRIVE_BOOKED",
          consent: true,
          respondBy: new Date(Date.now() + 5 * 60 * 1000),
          showroomId,
          assignedToId: consultantId,
          variantId,
          usedCarId: data.usedCarId ?? null,
        },
      });
      return tx.testDrive.create({
        data: {
          slotStart: slot,
          customerName: data.name,
          customerPhone: data.phone,
          showroomId,
          demoCarId: data.demoCarId,
          usedCarId: data.usedCarId,
          leadId: lead.id,
        },
      });
    });
    testDriveId = created.id;
  } catch (e) {
    const code = (e as { code?: string }).code;
    const message = String((e as Error).message ?? "");
    // The unique constraints in the database stop two people booking one slot
    if (code === "P2002" || message.includes("Unique constraint")) fail(back, "taken");
    throw e;
  }

  redirect(`/test-drive/confirmed?id=${testDriveId}`);
}