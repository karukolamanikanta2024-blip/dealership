export type EmiInput = {
  price: number; // total to be paid for the car, in rupees
  downPayment: number;
  annualRatePct: number; // for example 9 means 9% a year
  months: number;
};

export type EmiResult = { loan: number; emi: number; totalPayable: number; totalInterest: number };

export function calculateEmi({ price, downPayment, annualRatePct, months }: EmiInput): EmiResult {
  const valid =
    Number.isFinite(price) &&
    Number.isFinite(downPayment) &&
    Number.isFinite(annualRatePct) &&
    Number.isInteger(months) &&
    price > 0 &&
    downPayment >= 0 &&
    downPayment <= price &&
    annualRatePct >= 0 &&
    annualRatePct <= 30 &&
    months >= 6 &&
    months <= 84;
  if (!valid) throw new Error("Invalid EMI inputs");

  const loan = Math.round(price - downPayment);
  if (loan === 0) return { loan: 0, emi: 0, totalPayable: 0, totalInterest: 0 };

  const r = annualRatePct / 12 / 100; // monthly rate
  const emi =
    r === 0
      ? Math.round(loan / months)
      : Math.round((loan * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));

  const totalPayable = emi * months;
  return { loan, emi, totalPayable, totalInterest: totalPayable - loan };
}