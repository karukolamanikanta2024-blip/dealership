import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Brand X Lucknow | New and certified used cars",
    template: "%s | Brand X Lucknow",
  },
  description: "Browse new and certified used cars, see the on-road price in your city and book a test drive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-white text-neutral-900 antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <header className="border-b border-neutral-200">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4" aria-label="Main">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="h-3 w-3 rounded-full bg-teal-700" aria-hidden="true" />
              Brand X Lucknow
            </Link>
            <div className="flex items-center gap-5 text-sm text-neutral-600">
              <Link href="/" className="hover:text-neutral-900">New cars</Link>
              <Link href="/used" className="hover:text-neutral-900">Used cars</Link>
              <Link href="/login" className="hover:text-neutral-900">Staff</Link>
            </div>
          </nav>
        </header>
        <div id="main">{children}</div>
        <footer className="mt-16 border-t border-neutral-200">
          <p className="mx-auto max-w-4xl px-6 py-6 text-xs text-neutral-500">
            Prices are indicative and may change without notice. Sample data for demonstration.
          </p>
        </footer>
      </body>
    </html>
  );
}