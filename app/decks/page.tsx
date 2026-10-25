import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { createDeck, deleteDeck } from "@/app/actions/decks";
import { logout } from "@/app/actions/auth";

async function Decks() {
  const user = await requireUser();
  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { cards: { select: { nextReview: true } } },
  });
  const now = new Date();

  return (
    <main className="mx-auto max-w-xl px-8 py-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">My decks</h1>
        <form action={logout}>
          <button className="text-sm text-muted underline underline-offset-4 hover:text-ink">
            Log out ({user.email})
          </button>
        </form>
      </div>

      <form action={createDeck} className="mb-8 flex gap-2">
        <input
          name="name"
          placeholder="New deck name"
          required
          maxLength={100}
          className="flex-1 rounded-md border border-line bg-transparent px-3 py-2 placeholder:text-muted"
        />
        <button className="rounded-md bg-accent px-4 py-2 font-bold text-accent-ink">Add deck</button>
      </form>

      {decks.length === 0 ? (
        <p className="text-muted">No decks yet. Name your first deck above, for example “English verbs”.</p>
      ) : (
        <ul className="border-t border-line">
          {decks.map((deck) => {
            const total = deck.cards.length;
            const due = deck.cards.filter((c) => c.nextReview <= now).length;

            return (
              <li key={deck.id} className="flex items-center justify-between gap-4 border-b border-line py-4">
                <div>
                  <Link href={`/decks/${deck.id}`} className="font-display text-lg font-bold hover:underline">
                    {deck.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {total} {total === 1 ? "card" : "cards"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {due > 0 ? (
                    <Link
                      href={`/decks/${deck.id}/study`}
                      className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink"
                    >
                      Study {due} {due === 1 ? "card" : "cards"}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">Nothing due</span>
                  )}
                  <form action={deleteDeck}>
                    <input type="hidden" name="id" value={deck.id} />
                    <button className="text-sm text-danger underline underline-offset-4">Delete</button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default function DecksPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <Decks />
    </Suspense>
  );
}