
// ASSUMPTIONS: showrooms open 10:00-18:00 IST, Monday to Saturday, 1-hour slots,
// bookable from 2 hours ahead up to 7 days ahead.
const IST_OFFSET_MIN = 330; // IST is UTC+5:30 and has no daylight saving
const OPEN_HOUR = 10;
const CLOSE_HOUR = 18;
const MIN_LEAD_MS = 2 * 60 * 60 * 1000;
const DAYS_AHEAD = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function istDate(d: Date) {
  const shifted = new Date(d.getTime() + IST_OFFSET_MIN * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(), // 0 = Sunday
  };
}

export function generateSlots(now: Date = new Date()): Date[] {
  const slots: Date[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const { year, month, day, weekday } = istDate(new Date(now.getTime() + i * DAY_MS));
    if (weekday === 0) continue; // closed on Sundays
    for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
      const start = new Date(Date.UTC(year, month, day, hour, 0) - IST_OFFSET_MIN * 60 * 1000);
      if (start.getTime() >= now.getTime() + MIN_LEAD_MS) slots.push(start);
    }
  }
  return slots;
}

// Server-side check: only exact slots from generateSlots are accepted
export function isValidSlot(slot: Date, now: Date = new Date()): boolean {
  return generateSlots(now).some((s) => s.getTime() === slot.getTime());
}

export function formatSlot(slot: Date): string {
  return slot.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}