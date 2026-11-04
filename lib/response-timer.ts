// ASSUMPTION: the response target is 5 minutes from when the lead is created.
export const RESPONSE_SLA_MS = 5 * 60 * 1000;

export type TimerState =
  | { kind: "responded"; minutes: number }
  | { kind: "responded-late"; minutes: number }
  | { kind: "due"; minutes: number }
  | { kind: "overdue"; minutes: number };

export function responseState(
  lead: { createdAt: Date; firstResponseAt: Date | null },
  now: Date = new Date()
): TimerState {
  if (lead.firstResponseAt) {
    const took = lead.firstResponseAt.getTime() - lead.createdAt.getTime();
    return {
      kind: took <= RESPONSE_SLA_MS ? "responded" : "responded-late",
      minutes: Math.max(0, Math.floor(took / 60000)),
    };
  }
  const remaining = lead.createdAt.getTime() + RESPONSE_SLA_MS - now.getTime();
  if (remaining >= 0) return { kind: "due", minutes: Math.ceil(remaining / 60000) };
  return { kind: "overdue", minutes: Math.floor(-remaining / 60000) };
}