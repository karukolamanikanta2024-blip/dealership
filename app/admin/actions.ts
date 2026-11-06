"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { priceRuleSchema, usedCarSchema, variantPriceSchema } from "@/lib/admin-schemas";

// Every admin action checks the role again on the server
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
}

export async function updateVariantPrice(formData: FormData) {
  await requireAdmin();
  const parsed = variantPriceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin?error=invalid");

  await prisma.variant.update({
    where: { id: parsed.data.variantId },
    data: { exShowroomPrice: parsed.data.exShowroomPrice },
  });
  redirect("/admin?saved=1");
}

export async function updatePriceRule(formData: FormData) {
  await requireAdmin();
  const parsed = priceRuleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin?error=invalid");

  const d = parsed.data;
  await prisma.priceRule.update({
    where: { id: d.ruleId },
    data: {
      roadTaxPct: d.roadTaxPct,
      insurance: d.insurance,
      accessories: d.accessories,
      otherCharges: d.otherCharges,
      // valid through the end of that day, Indian time
      validUntil: new Date(`${d.validUntil}T23:59:59+05:30`),
    },
  });
  redirect("/admin?saved=1");
}

export async function updateUsedCar(formData: FormData) {
  await requireAdmin();
  const parsed = usedCarSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin?error=invalid");

  await prisma.usedCar.update({
    where: { id: parsed.data.carId },
    data: { price: parsed.data.price, status: parsed.data.status },
  });
  redirect("/admin?saved=1");
}