import Link from "next/link";
import { login } from "./actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const input = "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base";

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">← Home</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Staff login</h1>
      <p className="mt-1 text-sm text-neutral-600">For sales consultants and administrators.</p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Incorrect email or password.
        </p>
      )}

      <form action={login} className="mt-6 space-y-4">
        <label className="block text-sm">
          Email
          <input name="email" type="email" required autoComplete="username" className={input} />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required autoComplete="current-password" className={input} />
        </label>
        <button type="submit" className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white hover:bg-neutral-700">
          Log in
        </button>
      </form>
    </main>
  );
}