"use client";

import { useState } from "react";

export default function DraftBox({ draft }: { draft: string }) {
  const [text, setText] = useState(draft);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available: the person can still select and copy the text
    }
  }

  return (
    <div className="mt-2">
      <label className="block text-xs text-neutral-500">
        Edit before sending
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
        />
      </label>
      <button type="button" onClick={copy} className="mt-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700">
        {copied ? "Copied" : "Copy reply"}
      </button>
    </div>
  );
}