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
  title: "Flashcards",
  description: "Study with spaced repetition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${atkinson.variable} ${bricolage.variable}`}>
      <body className="min-h-screen antialiased">
        <header className="border-b border-line">
          <div className="mx-auto max-w-xl px-8 py-4">
            <Link href="/" className="inline-flex items-center gap-3 font-display text-xl font-bold">
              <span
                aria-hidden
                className="inline-block h-5 w-7 -rotate-6 rounded-[3px] border border-ink/40 bg-accent"
              />
              Flashcards
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}