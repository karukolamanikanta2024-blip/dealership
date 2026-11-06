import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DraftButton from "./draft-button";
import DraftBox from "./draft-box";
import { getSession } from "@/lib/session";
import { responseState, type TimerState } from "@/lib/response-timer";
import { logout } from "../login/actions";
import { updateLeadStatus ,draftWithAI} from "./actions";
import AutoRefresh from "./auto-refresh";

export const dynamic = "force-dynamic";

const IST = "Asia/Kolkata";

function timerBadge(s: TimerState) {
  switch (s.kind) {
    case "responded":
      return { text: `Replied in ${s.minutes} min`, cls: "bg-green-100 text-green-800" };
    case "responded-late":
      return { text: `Replied after ${s.minutes} min`, cls: "bg-amber-100 text-amber-800" };
    case "due":
      return { text: `Reply within ${s.minutes} min`, cls: "bg-blue-100 text-blue-800" };
    case "overdue":
      return { text: `Overdue by ${s.minutes} min`, cls: "bg-red-100 text-red-800" };
  }
}

export default async function Inbox() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const leads = await prisma.lead.findMany({
    where: user.role === "ADMIN" ? {} : { assignedToId: user.id },
    include: {
      variant: { include: { model: true } },
      usedCar: true,
      showroom: true,
      assignedTo: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const now = new Date();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <AutoRefresh />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Lead inbox</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {user.name} · {user.role === "ADMIN" ? "Administrator (all leads)" : "Sales consultant (your leads)"}
          </p>
        </div>
        <form action={logout}>
          <button type="submit" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-500">
            Log out
          </button>
        </form>
      </div>

      {leads.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
          <p className="font-medium">No leads yet</p>
          <p className="mt-1 text-sm text-neutral-600">New enquiries and test-drive bookings will appear here.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {leads.map((l) => {
            const badge = timerBadge(responseState(l, now));
            const car = l.variant
              ? `${l.variant.model.name} ${l.variant.name}`
              : l.usedCar
                ? `${l.usedCar.year} ${l.usedCar.modelName} ${l.usedCar.variantName} (used)`
                : "No car selected";
            return (
              <li key={l.id} className="rounded-xl border border-neutral-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-medium">{l.name}</p>
                  <span className={`rounded-full px-3 py-1 text-xs ${badge.cls}`}>{badge.text}</span>
                </div>
                <p className="mt-1 text-sm">
                  <a href={`tel:${l.phone}`} className="underline">{l.phone}</a>
                  {l.email && <span className="text-neutral-500"> · {l.email}</span>}
                </p>
                <p className="mt-2 text-sm text-neutral-700">{car}</p>
                {l.message && <p className="mt-1 text-sm text-neutral-600">“{l.message}”</p>}
                <p className="mt-2 text-xs text-neutral-500">
                  {l.source.replace("_", " ").toLowerCase()} · {l.showroom.name}
                  {user.role === "ADMIN" && l.assignedTo ? ` · assigned to ${l.assignedTo.name}` : ""}
                  {" · "}
                  {l.createdAt.toLocaleString("en-IN", { timeZone: IST, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                </p>
                                <form action={draftWithAI} className="mt-4">
                  <input type="hidden" name="leadId" value={l.id} />
                  <DraftButton label={l.aiReplyDraft ? "Redo draft" : "Draft reply"} />
                </form>
                {l.aiSummary && (
                  <div className="mt-3 rounded-lg bg-neutral-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {l.aiDraftSource === "ai" ? "AI draft — check before sending" : "Template draft (AI not used)"}
                    </p>
                    <p className="mt-2 text-sm text-neutral-700">{l.aiSummary}</p>
                    <DraftBox key={l.aiReplyDraft ?? ""} draft={l.aiReplyDraft ?? ""} />
                  </div>
                )}
                <form action={updateLeadStatus} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="leadId" value={l.id} />
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs capitalize">
                    {l.status.replaceAll("_", " ").toLowerCase()}
                  </span>
                  <select name="status" defaultValue="CONTACTED" className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm">
                    <option value="CONTACTED">Contacted</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                  <button type="submit" className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700">
                    Update
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}