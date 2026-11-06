import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">We could not find that page</h1>
      <p className="mt-2 text-neutral-600">The car may have been sold, or the address may be wrong.</p>
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link href="/" className="underline">New cars</Link>
        <Link href="/used" className="underline">Used cars</Link>
      </div>
    </div>
  );
}