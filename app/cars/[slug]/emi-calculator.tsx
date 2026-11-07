"use client";

import { useState } from "react";
import { calculateEmi } from "@/lib/emi";
import { formatRupees } from "@/lib/pricing";

// ASSUMPTION: 9% is only a starting value. The real rate depends on the lender.
export default function EmiCalculator({ price }: { price: number }) {
  const [down, setDown] = useState(String(Math.round(price * 0.2)));
  const [rate, setRate] = useState("9");
  const [months, setMonths] = useState("60");

  let result = null;
  let problem: string | null = null;
  if (down.trim() === "" || rate.trim() === "") {
    problem = "Enter a down payment and an interest rate.";
  } else {
    try {
      result = calculateEmi({
        price,
        downPayment: Number(down),
        annualRatePct: Number(rate),
        months: Number(months),
      });
    } catch {
      problem = "Down payment cannot be more than the price, and the rate must be between 0 and 30%.";
    }
  }

  const input = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base";

  return (
    <section className="mt-8 rounded-xl border border-neutral-200 p-6">
      <h2 className="text-lg font-medium">EMI calculator</h2>
      <p className="mt-1 text-sm text-neutral-600">On the on-road price of {formatRupees(price)}.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          Down payment (₹)
          <input type="number" min={0} max={price} step={1000} value={down} onChange={(e) => setDown(e.target.value)} className={input} />
        </label>
        <label className="text-sm">
          Interest rate (% a year)
          <input type="number" min={0} max={30} step={0.1} value={rate} onChange={(e) => setRate(e.target.value)} className={input} />
        </label>
        <label className="text-sm">
          Tenure
          <select value={months} onChange={(e) => setMonths(e.target.value)} className={input}>
            {[36, 48, 60, 72, 84].map((m) => (
              <option key={m} value={m}>{m} months</option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-5">
        {problem ? (
          <p className="text-sm text-red-700">{problem}</p>
        ) : (
          result && (
            <>
              <p className="text-sm text-neutral-600">Monthly EMI</p>
              <p className="text-3xl font-semibold tracking-tight">{formatRupees(result.emi)}</p>
              <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-neutral-500">Loan amount</dt>
                <dd>{formatRupees(result.loan)}</dd>
                <dt className="text-neutral-500">Total interest</dt>
                <dd>{formatRupees(result.totalInterest)}</dd>
                <dt className="text-neutral-500">Total payable</dt>
                <dd>{formatRupees(result.totalPayable)}</dd>
              </dl>
            </>
          )
        )}
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        This is an estimate. The interest rate and final terms are set by the lender.
      </p>
    </section>
  );
}