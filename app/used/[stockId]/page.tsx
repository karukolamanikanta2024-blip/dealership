import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatRupees } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ stockId: string }> };

export default async function UsedCarPage({ params }: Props) {
  const { stockId } = await params;
  const car = await prisma.usedCar.findUnique({
    where: { stockId },
    include: { showroom: true },
  });
  if (!car || car.status === "SOLD") notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/used" className="text-sm text-neutral-500 hover:text-neutral-800">← All used cars</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {car.year} {car.modelName} {car.variantName}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">Stock ID {car.stockId} · {car.showroom.name}</p>

      <div className="mt-6 flex items-center gap-3">
        <p className="text-2xl font-semibold">{formatRupees(car.price)}</p>
        {car.status === "BOOKED" && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
            Booked — ask us about similar cars
          </span>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Details</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-3 text-sm">
          <Spec label="Year" value={String(car.year)} />
          <Spec label="Kilometres driven" value={`${car.kmDriven.toLocaleString("en-IN")} km`} />
          <Spec label="Owners" value={String(car.owners)} />
          <Spec label="Fuel" value={car.fuel.toLowerCase()} />
          <Spec label="Transmission" value={car.transmission.toLowerCase()} />
          <Spec label="Colour" value={car.colour} />
          <Spec label="Registration" value={car.registrationMasked} />
        </dl>
      </section>

      <section className="mt-8 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-medium">Inspection report</h2>
        <p className="mt-2 text-sm">
          Overall score: <span className="font-semibold">{car.inspectionScore} / 100</span>
        </p>
        <p className="mt-2 text-sm text-neutral-600">{car.inspectionNotes}</p>
      </section>
              {car.status === "AVAILABLE" && (
        <Link
          href={`/test-drive?used=${car.stockId}`}
          className="mt-8 inline-block rounded-lg bg-neutral-900 px-5 py-3 text-base font-medium text-white hover:bg-neutral-700"
        >
          Book a test drive
        </Link>
      )}
      <section className="mt-8 text-sm text-neutral-600">
        <p>View this car at <span className="font-medium text-neutral-900">{car.showroom.name}</span></p>
        <p>{car.showroom.address}</p>
        <p>Phone: {car.showroom.phone}</p>
      </section>
    </main>
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