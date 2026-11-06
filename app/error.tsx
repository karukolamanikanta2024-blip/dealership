"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center" role="alert">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-neutral-600">We could not load this page. Please try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Try again
      </button>
    </div>
  );
}