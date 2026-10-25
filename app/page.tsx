import Link from "next/link";
import { primaryButton, secondaryButton } from "@/lib/ui";

export default function Home() {
  return (
    <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
      <div>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
          Review each card just before you forget it.
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted">
          Add your cards, study the ones that are due, and the app schedules the next review for you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className={primaryButton}>
            Sign up
          </Link>
          <Link href="/login" className={secondaryButton}>
            Log in
          </Link>
        </div>
      </div>

      <div aria-hidden className="relative mx-auto w-full max-w-md">
        <div className="flashcard-face absolute inset-0 translate-x-3 translate-y-3 rotate-3 opacity-60" />
        <div className="flashcard-face relative grid h-56 -rotate-2 place-items-center p-6">
          <p className="font-display text-4xl font-bold">to run</p>
        </div>
      </div>
    </main>
  );
}