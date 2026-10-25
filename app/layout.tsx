import type { Metadata } from "next";
import Link from "next/link";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flash",
  description: "Study with spaced repetition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="flash" className={`${atkinson.variable} ${bricolage.variable}`}>
      <body className="min-h-screen antialiased">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="inline-flex min-h-11 items-center gap-3 font-display text-xl font-bold">
              <span
                aria-hidden
                className="inline-block h-5 w-7 -rotate-6 rounded-[3px] border border-black/40 bg-accent"
              />
              Flash
            </Link>
            <nav aria-label="Main">
              <Link
                href="/decks"
                className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-ink"
              >
                My decks
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}