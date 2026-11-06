export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12" role="status" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 space-y-3">
        <div className="h-16 animate-pulse rounded bg-neutral-100" />
        <div className="h-16 animate-pulse rounded bg-neutral-100" />
        <div className="h-16 animate-pulse rounded bg-neutral-100" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}