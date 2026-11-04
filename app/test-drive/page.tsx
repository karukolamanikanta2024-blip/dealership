import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { generateSlots } from "@/lib/slots";
import { bookTestDrive } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ variant?: string; used?: string; showroom?: string; error?: string }>;
};

const ERRORS: Record<string, string> = {
  invalid: "Please check your details and choose a time slot.",
  taken: "Sorry, someone just booked that slot. Please choose another time.",
  unavailable: "This car is no longer available for a test drive.",
};

const IST = "Asia/Kolkata";
const dayLabel = (d: Date) =>
  d.toLocaleDateString("en-IN", { timeZone: IST, weekday: "long", day: "numeric", month: "long" });
const timeLabel = (d: Date) =>
  d.toLocaleTimeString("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit" });

export default async function TestDrivePage({ searchParams }: Props) {
  const sp = await searchParams;

  let title: string;
  let showroom: { name: string; slug: string; address: string };
  let back: string;
  let targetWhere: { demoCarId: number } | { usedCarId: number };
  let showroomChoices: { name: string; slug: string }[] = [];

  if (sp.used) {
    const car = await prisma.usedCar.findUnique({
      where: { stockId: sp.used },
      include: { showroom: true },
    });
    if (!car || car.status !== "AVAILABLE") notFound();
    title = `${car.year} ${car.modelName} ${car.variantName}`;
    showroom = car.showroom;
    back = `/test-drive?used=${car.stockId}`;
    targetWhere = { usedCarId: car.id };
  } else if (sp.variant) {
    const variant = await prisma.variant.findUnique({
      where: { slug: sp.variant },
      include: { model: true, demoCars: { include: { showroom: true } } },
    });
    if (!variant || variant.demoCars.length === 0) notFound();
    const demo = variant.demoCars.find((d) => d.showroom.slug === sp.showroom) ?? variant.demoCars[0];
    title = `${variant.model.name} ${variant.name}`;
    showroom = demo.showroom;
    back = `/test-drive?variant=${variant.slug}&showroom=${demo.showroom.slug}`;
    targetWhere = { demoCarId: demo.id };
    showroomChoices = variant.demoCars.map((d) => ({ name: d.showroom.name, slug: d.showroom.slug }));
  } else {
    notFound();
  }

  const slots = generateSlots();
  const taken = await prisma.testDrive.findMany({
    where: { ...targetWhere, slotStart: { in: slots } },
    select: { slotStart: true },
  });
  const takenSet = new Set(taken.map((t) => t.slotStart.getTime()));

  const days = new Map<string, Date[]>();
  for (const s of slots) {
    const key = dayLabel(s);
    days.set(key, [...(days.get(key) ?? []), s]);
  }

  const input = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base";

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">← Home</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Book a test drive</h1>
      <p className="mt-1 text-neutral-600">{title}</p>

      {sp.error && ERRORS[sp.error] && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {ERRORS[sp.error]}
        </p>
      )}

      {showroomChoices.length > 1 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">Showroom</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {showroomChoices.map((s) => (
              <Link
                key={s.slug}
                href={`/test-drive?variant=${sp.variant}&showroom=${s.slug}`}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  s.slug === showroom.slug
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}
      <p className="mt-4 text-sm text-neutral-600">
        {showroom.name}, {showroom.address}
      </p>

      <form action={bookTestDrive} className="mt-8 space-y-8">
        <input type="hidden" name="back" value={back} />
        {"demoCarId" in targetWhere && <input type="hidden" name="demoCarId" value={targetWhere.demoCarId} />}
        {"usedCarId" in targetWhere && <input type="hidden" name="usedCarId" value={targetWhere.usedCarId} />}

        <fieldset>
          <legend className="text-lg font-medium">Choose a time</legend>
          <p className="mt-1 text-sm text-neutral-500">All times are Indian Standard Time. Closed on Sundays.</p>
          {[...days.entries()].map(([day, list]) => (
            <div key={day} className="mt-4">
              <p className="text-sm font-medium">{day}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {list.map((s) => {
                  const isTaken = takenSet.has(s.getTime());
                  return (
                    <label key={s.toISOString()}>
                      <input
                        type="radio"
                        name="slot"
                        value={s.toISOString()}
                        disabled={isTaken}
                        required
                        className="peer sr-only"
                      />
                      <span className="block cursor-pointer rounded-lg border border-neutral-300 px-3 py-2 text-sm peer-checked:border-neutral-900 peer-checked:bg-neutral-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-900 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:text-neutral-400 peer-disabled:line-through">
                        {timeLabel(s)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </fieldset>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Your details</h2>
          <label className="block text-sm">
            Full name
            <input name="name" type="text" required minLength={2} maxLength={80} autoComplete="name" className={input} />
          </label>
          <label className="block text-sm">
            Mobile number
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              autoComplete="tel-national"
              className={input}
            />
            <span className="mt-1 block text-xs text-neutral-500">10-digit Indian mobile number</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-neutral-700">
            <input name="consent" type="checkbox" required className="mt-1 h-4 w-4" />
            <span>
              I agree to be contacted about this test drive. My details are used only for this booking and I can ask the
              showroom to delete them at any time.
            </span>
          </label>
        </section>

        <button type="submit" className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white hover:bg-neutral-700">
          Confirm test drive
        </button>
      </form>
           
    </main>
  );
}