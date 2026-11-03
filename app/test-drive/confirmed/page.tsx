import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatSlot } from "@/lib/slots";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function Confirmed({ searchParams }: Props) {
  const { id } = await searchParams;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();

  const booking = await prisma.testDrive.findUnique({
    where: { id: n },
    include: { showroom: true, demoCar: true, usedCar: true, lead: { include: { assignedTo: true } } },
  });
  if (!booking) notFound();

  const car = booking.demoCar
    ? booking.demoCar.label
    : booking.usedCar
      ? `${booking.usedCar.year} ${booking.usedCar.modelName} ${booking.usedCar.variantName}`
      : "your chosen car";
  const consultant = booking.lead.assignedTo;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Your test drive is booked</h1>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="text-neutral-500">Car</dt>
          <dd className="text-base">{car}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">When</dt>
          <dd className="text-base">{formatSlot(booking.slotStart)}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Where</dt>
          <dd className="text-base">
            {booking.showroom.name}, {booking.showroom.address}
            <br />
            Phone: {booking.showroom.phone}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Your consultant</dt>
          <dd className="text-base">
            {consultant ? `${consultant.name} will contact you shortly to confirm.` : "Our team will contact you shortly to confirm."}
          </dd>
        </div>
      </dl>
      <Link href="/" className="mt-10 inline-block text-sm underline">Back to home</Link>
    </main>
  );
}