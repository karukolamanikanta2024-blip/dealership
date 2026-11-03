import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { calculateOnRoadPrice, formatRupees } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string; variant?: string }>;
};

export default async function ModelPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { city: cityParam, variant: variantParam } = await searchParams;

  const model = await prisma.carModel.findUnique({
    where: { slug },
    include: { variants: { orderBy: { exShowroomPrice: "asc" } } },
  });
  if (!model) notFound();

  const cities = await prisma.city.findMany({ orderBy: { name: "asc" } });
  const city = cities.find((c) => c.name.toLowerCase() === cityParam?.toLowerCase()) ?? cities[0];
  const variant = model.variants.find((v) => v.slug === variantParam) ?? model.variants[0];

  const rule = await prisma.priceRule.findUnique({
    where: { variantId_cityId: { variantId: variant.id, cityId: city.id } },
  });

  const breakup = rule
    ? calculateOnRoadPrice({
        exShowroomPrice: variant.exShowroomPrice,
        roadTaxPct: Number(rule.roadTaxPct),
        insurance: rule.insurance,
        accessories: rule.accessories,
        otherCharges: rule.otherCharges,
        validUntil: rule.validUntil,
      })
    : null;

  const link = (c: string, v: string) => `/cars/${model.slug}?city=${encodeURIComponent(c)}&variant=${v}`;
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:border-neutral-500"}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">← All models</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{model.name}</h1>
      <p className="mt-1 text-neutral-600">{model.tagline}</p>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">Variant</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {model.variants.map((v) => (
            <Link key={v.id} href={link(city.name, v.slug)} className={chip(v.id === variant.id)}>
              {v.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">City</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {cities.map((c) => (
            <Link key={c.id} href={link(c.name, variant.slug)} className={chip(c.id === city.id)}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>
             <Link
        href={`/test-drive?variant=${variant.slug}`}
        className="mt-8 inline-block rounded-lg bg-neutral-900 px-5 py-3 text-base font-medium text-white hover:bg-neutral-700"
      >
        Book a test drive
      </Link>
      <section className="mt-8 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">On-road price in {city.name}</h2>
        {breakup ? (
          <>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Ex-showroom price" value={breakup.exShowroom} />
              <Row label={`Road tax (${Number(rule!.roadTaxPct)}%)`} value={breakup.roadTax} />
              <Row label="Insurance" value={breakup.insurance} />
              <Row label="Accessories" value={breakup.accessories} />
              <Row label="Registration, FASTag and handling" value={breakup.otherCharges} />
              <div className="flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold">
                <dt>On-road price</dt>
                <dd>{formatRupees(breakup.total)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-neutral-500">
              {breakup.expired
                ? "This price has expired. Please contact the showroom for the latest price. "
                : `Valid until ${breakup.validUntil.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. `}
              Prices may change without notice.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-neutral-600">
            The on-road price for {variant.name} in {city.name} is not available yet. Please contact the showroom.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Specifications</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-3 text-sm">
          <Spec label="Engine" value={variant.engine} />
          <Spec label="Power" value={`${variant.powerBhp} bhp`} />
          <Spec label="Fuel" value={variant.fuel.toLowerCase()} />
          <Spec label="Transmission" value={variant.transmission.toLowerCase()} />
          <Spec label="Mileage" value={`${variant.mileageKmpl} km/l`} />
          <Spec label="Seats" value={String(variant.seats)} />
          <Spec label="Colours" value={variant.colours.join(", ")} />
        </dl>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-600">{label}</dt>
      <dd>{formatRupees(value)}</dd>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="capitalize">{value}</dd>
    </>
  );
}