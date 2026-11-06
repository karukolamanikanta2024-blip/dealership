import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "https://dealership.vercel.app";
  const [models, used] = await Promise.all([
    prisma.carModel.findMany({ select: { slug: true } }),
    prisma.usedCar.findMany({ where: { status: { in: ["AVAILABLE", "BOOKED"] } }, select: { stockId: true } }),
  ]);
  return [
    { url: base },
    { url: `${base}/used` },
    ...models.map((m) => ({ url: `${base}/cars/${m.slug}` })),
    ...used.map((c) => ({ url: `${base}/used/${c.stockId}` })),
  ];
}