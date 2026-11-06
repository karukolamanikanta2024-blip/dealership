import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatRupees } from "@/lib/pricing";
import { logout } from "../login/actions";
import { updateVariantPrice, updatePriceRule, updateUsedCar } from "./actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ saved?: string; error?: string }> };

const field = "mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm";
const saveBtn = "rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700";
const istDate = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // 2026-12-31

export default async function Admin({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/inbox");
  const sp = await searchParams;

  const variants = await prisma.variant.findMany({
    include: { model: true, priceRules: { include: { city: true }, orderBy: { cityId: "asc" } } },
    orderBy: [{ modelId: "asc" }, { exShowroomPrice: "asc" }],
  });
  const usedCars = await prisma.usedCar.findMany({ orderBy: { stockId: "asc" } });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Prices and stock</h1>
          <p className="mt-1 text-sm text-neutral-600">Changes appear on the public pages straight away.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inbox" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-500">
            Inbox
          </Link>
          <form action={logout}>
            <button type="submit" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-500">
              Log out
            </button>
          </form>
        </div>
      </div>

      {sp.saved && (
        <p role="status" className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">Saved.</p>
      )}
      {sp.error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Nothing was saved. Please check the values (no blanks, road tax 0 to 30%, a valid date).
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">New cars: prices by city</h2>
        <div className="mt-4 space-y-6">
          {variants.map((v) => (
            <div key={v.id} className="rounded-xl border border-neutral-200 p-5">
              <h3 className="text-lg font-medium">{v.model.name} {v.name}</h3>
              <form action={updateVariantPrice} className="mt-3 flex flex-wrap items-end gap-3">
                <input type="hidden" name="variantId" value={v.id} />
                <label className="text-sm">
                  Ex-showroom price (₹)
                  <input name="exShowroomPrice" type="number" min={100000} step={1} required defaultValue={v.exShowroomPrice} className={field} />
                </label>
                <button type="submit" className={saveBtn}>Save price</button>
                <span className="pb-1.5 text-xs text-neutral-500">Now {formatRupees(v.exShowroomPrice)}</span>
              </form>

              <div className="mt-5 space-y-4">
                {v.priceRules.map((r) => (
                  <form key={r.id} action={updatePriceRule} className="rounded-lg bg-neutral-50 p-4">
                    <input type="hidden" name="ruleId" value={r.id} />
                    <p className="text-sm font-medium">{r.city.name}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
                      <label className="text-xs text-neutral-600">
                        Road tax %
                        <input name="roadTaxPct" type="number" step="0.01" min={0} max={30} required defaultValue={Number(r.roadTaxPct)} className={field} />
                      </label>
                      <label className="text-xs text-neutral-600">
                        Insurance ₹
                        <input name="insurance" type="number" min={0} step={1} required defaultValue={r.insurance} className={field} />
                      </label>
                      <label className="text-xs text-neutral-600">
                        Accessories ₹
                        <input name="accessories" type="number" min={0} step={1} required defaultValue={r.accessories} className={field} />
                      </label>
                      <label className="text-xs text-neutral-600">
                        Other charges ₹
                        <input name="otherCharges" type="number" min={0} step={1} required defaultValue={r.otherCharges} className={field} />
                      </label>
                      <label className="text-xs text-neutral-600">
                        Valid until
                        <input name="validUntil" type="date" required defaultValue={istDate(r.validUntil)} className={field} />
                      </label>
                    </div>
                    <button type="submit" className={`${saveBtn} mt-3`}>Save {r.city.name} rules</button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Used cars</h2>
        <ul className="mt-4 space-y-3">
          {usedCars.map((c) => (
            <li key={c.id} className="rounded-xl border border-neutral-200 p-4">
              <form action={updateUsedCar} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="carId" value={c.id} />
                <p className="min-w-48 text-sm">
                  <span className="font-medium">{c.stockId}</span>
                  <span className="block text-neutral-600">{c.year} {c.modelName} {c.variantName}</span>
                </p>
                <label className="text-xs text-neutral-600">
                  Price ₹
                  <input name="price" type="number" min={50000} step={1} required defaultValue={c.price} className={field} />
                </label>
                <label className="text-xs text-neutral-600">
                  Status
                  <select name="status" defaultValue={c.status} className={field}>
                    <option value="AVAILABLE">Available</option>
                    <option value="BOOKED">Booked</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </label>
                <button type="submit" className={saveBtn}>Save</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}