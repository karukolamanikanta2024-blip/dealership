export type PriceRuleInput = {
  exShowroomPrice: number; // rupees
  roadTaxPct: number; // e.g. 9 means 9%
  insurance: number;
  accessories: number;
  otherCharges: number;
  validUntil: Date;
};

export type OnRoadBreakup = {
  exShowroom: number;
  roadTax: number;
  insurance: number;
  accessories: number;
  otherCharges: number;
  total: number;
  validUntil: Date;
  expired: boolean;
};

export function calculateOnRoadPrice(
  input: PriceRuleInput,
  today: Date = new Date()
): OnRoadBreakup {
  const { exShowroomPrice, roadTaxPct, insurance, accessories, otherCharges, validUntil } = input;

  const numbers = [exShowroomPrice, roadTaxPct, insurance, accessories, otherCharges];
  if (numbers.some((n) => !Number.isFinite(n) || n < 0)) {
    throw new Error("Price inputs must be non-negative numbers");
  }

  // Road tax is a percentage of the ex-showroom price, rounded to whole rupees
  const roadTax = Math.round((exShowroomPrice * roadTaxPct) / 100);
  const total = exShowroomPrice + roadTax + insurance + accessories + otherCharges;

  return {
    exShowroom: exShowroomPrice,
    roadTax,
    insurance,
    accessories,
    otherCharges,
    total,
    validUntil,
    expired: validUntil.getTime() < today.getTime(),
  };
}

export function formatRupees(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}