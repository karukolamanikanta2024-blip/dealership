import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatRupees } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const models = await prisma.carModel.findMany({
    include: { variants: { orderBy: { exShowroomPrice: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">New cars</h1>
      <p className="mt-2 text-neutral-600">Choose a model to see its on-road price in your city.</p>
            <Link href="/used" className="mt-4 inline-block text-sm underline">
        Browse certified used cars →
      </Link>
      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {models.map((m) => (
          <li key={m.id}>
            <Link href={`/cars/${m.slug}`} className="flex items-center justify-between py-5 hover:bg-neutral-50">
              <span>
                <span className="block text-lg font-medium">{m.name}</span>
                <span className="block text-sm text-neutral-500">{m.bodyType} · {m.tagline}</span>
              </span>
              <span className="text-sm text-neutral-700">
                from {formatRupees(m.variants[0].exShowroomPrice)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
       <p className="mt-10 text-sm">
        <Link href="/login" className="text-neutral-500 underline">Staff login</Link>
      </p>
    </main>
  );
}