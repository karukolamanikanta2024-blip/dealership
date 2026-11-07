import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatRupees } from "@/lib/pricing";
import CarIllustration from "@/components/car-illustration";

export const dynamic = "force-dynamic";

const FUELS = ["PETROL", "DIESEL", "CNG", "ELECTRIC"] as const;
const PRICE_LIMITS = [600000, 1000000, 1500000];

type Props = {
  searchParams: Promise<{ model?: string; fuel?: string; maxPrice?: string }>;
};

export default async function UsedCars({ searchParams }: Props) {
  const sp = await searchParams;

  // Only accept known values from the URL
  const fuel = FUELS.find((f) => f === sp.fuel);
  const maxPrice = PRICE_LIMITS.find((p) => String(p) === sp.maxPrice);

  const allModels = await prisma.usedCar.findMany({
    distinct: ["modelName"],
    select: { modelName: true },
    orderBy: { modelName: "asc" },
  });
  const modelName = allModels.find((m) => m.modelName === sp.model)?.modelName;

  const cars = await prisma.usedCar.findMany({
    where: {
      status: { in: ["AVAILABLE", "BOOKED"] },
      ...(fuel ? { fuel } : {}),
      ...(modelName ? { modelName } : {}),
      ...(maxPrice ? { price: { lte: maxPrice } } : {}),
    },
    include: { showroom: true },
    orderBy: { price: "asc" },
  });

  const select = "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">← Home</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Certified used cars</h1>
      <p className="mt-2 text-neutral-600">Every car is inspected before it is listed.</p>

      <form method="get" className="mt-8 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-neutral-500">Model</span>
          <select name="model" defaultValue={modelName ?? ""} className={select}>
            <option value="">All models</option>
            {allModels.map((m) => (
              <option key={m.modelName} value={m.modelName}>{m.modelName}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-neutral-500">Fuel</span>
          <select name="fuel" defaultValue={fuel ?? ""} className={select}>
            <option value="">Any fuel</option>
            {FUELS.map((f) => (
              <option key={f} value={f}>{f.charAt(0) + f.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-neutral-500">Budget</span>
          <select name="maxPrice" defaultValue={maxPrice ? String(maxPrice) : ""} className={select}>
            <option value="">Any budget</option>
            {PRICE_LIMITS.map((p) => (
              <option key={p} value={p}>Up to {formatRupees(p)}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">
          Apply filters
        </button>
        <Link href="/used" className="py-2 text-sm text-neutral-500 hover:text-neutral-800">Clear</Link>
      </form>

      {cars.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No cars match these filters</p>
          <p className="mt-1 text-sm text-neutral-600">Try a different model, fuel or budget.</p>
          <Link href="/used" className="mt-4 inline-block text-sm underline">Clear filters</Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
                  {cars.map((c) => (
            <li key={c.id}>
              <Link href={`/used/${c.stockId}`} className="flex items-center justify-between gap-4 py-5 hover:bg-neutral-50">
                <span className="flex items-center gap-4">
                  <span className="hidden w-28 shrink-0 overflow-hidden rounded-lg sm:block">
                    <CarIllustration />
                  </span>
                  <span>
                    <span className="block text-lg font-medium">
                      {c.year} {c.modelName} {c.variantName}
                    </span>
                    <span className="block text-sm capitalize text-neutral-500">
                      {c.kmDriven.toLocaleString("en-IN")} km · {c.fuel.toLowerCase()} · {c.transmission.toLowerCase()} · {c.owners} {c.owners === 1 ? "owner" : "owners"}
                    </span>
                    <span className="block text-sm text-neutral-500">{c.showroom.name}</span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-medium">{formatRupees(c.price)}</span>
                  {c.status === "BOOKED" && (
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Booked</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      
    </main>
  );
}