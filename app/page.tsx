import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatRupees } from "@/lib/pricing";
import CarIllustration from "@/components/car-illustration";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [models, used] = await Promise.all([
    prisma.carModel.findMany({
      include: { variants: { orderBy: { exShowroomPrice: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.usedCar.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { year: "desc" },
      take: 3,
      include: { showroom: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6">
      <section className="py-16">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Find your next car and see the real price.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600">
          Every price shows the full on-road breakup for your city. Book a test drive online in under a minute.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#models" className="rounded-lg bg-teal-700 px-5 py-3 text-base font-medium text-white hover:bg-teal-800">
            See on-road prices
          </Link>
          <Link href="/used" className="rounded-lg border border-neutral-300 px-5 py-3 text-base font-medium hover:border-neutral-500">
            Certified used cars
          </Link>
        </div>
      </section>

      <section id="models" className="scroll-mt-8">
        <h2 className="text-2xl font-semibold tracking-tight">New cars</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {models.map((m) => (
            <Link key={m.id} href={`/cars/${m.slug}`} className="group overflow-hidden rounded-xl border border-neutral-200 hover:border-neutral-400">
              <CarIllustration label={`${m.name} illustration`} />
              <div className="p-4">
                <p className="text-lg font-medium">{m.name}</p>
                <p className="text-sm text-neutral-500">{m.bodyType}</p>
                <p className="mt-3 text-sm text-neutral-700">
                  From {formatRupees(m.variants[0].exShowroomPrice)} ex-showroom
                </p>
                <p className="mt-1 text-sm text-teal-700 group-hover:underline">See on-road price →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {used.length > 0 && (
        <section className="mt-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Certified used cars</h2>
            <Link href="/used" className="text-sm underline">View all</Link>
          </div>
          <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
            {used.map((c) => (
              <li key={c.id}>
                <Link href={`/used/${c.stockId}`} className="flex items-center justify-between gap-4 py-4 hover:bg-neutral-50">
                  <span>
                    <span className="block font-medium">{c.year} {c.modelName} {c.variantName}</span>
                    <span className="block text-sm text-neutral-500">
                      {c.kmDriven.toLocaleString("en-IN")} km · {c.showroom.name}
                    </span>
                  </span>
                  <span className="font-medium">{formatRupees(c.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}