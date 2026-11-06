"use client";

import { useFormStatus } from "react-dom";

export default function DraftButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-neutral-900 px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-60"
    >
      {pending ? "Drafting…" : label}
    </button>
  );
}