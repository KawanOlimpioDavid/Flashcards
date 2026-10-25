import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-8 py-12">
      <h1 className="font-display text-4xl font-bold leading-tight">
        Review each card just before you forget it.
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted">
        Add your cards, study the ones that are due, and the app schedules the next review for you.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/signup" className="rounded-md bg-accent px-5 py-2.5 font-bold text-accent-ink">
          Sign up
        </Link>
        <Link href="/login" className="rounded-md border border-ink px-5 py-2.5 font-bold">
          Log in
        </Link>
      </div>

      <div
        aria-hidden
        className="ruled mt-12 h-52 -rotate-2 rounded-md pl-[4.25rem] pr-8 pt-[4.8rem] shadow-lg"
      >
        <p className="font-display text-3xl font-bold leading-[2.4rem] text-paper-ink">to run</p>
      </div>
    </main>
  );
}