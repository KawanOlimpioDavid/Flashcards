import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { createDeck, deleteDeck } from "@/app/actions/decks";
import { logout } from "@/app/actions/auth";
import DeleteButton from "@/components/delete-button";
import { field, primaryButton } from "@/lib/ui";

async function Decks() {
  const user = await requireUser();
  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { cards: { select: { nextReview: true } } },
  });
  const now = new Date();
  const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">My decks</h1>
          <p className="mt-1 text-muted">
            {decks.length} {decks.length === 1 ? "deck" : "decks"}, {totalCards}{" "}
            {totalCards === 1 ? "card" : "cards"}
          </p>
        </div>
        <form action={logout}>
          <button className="min-h-11 px-2 text-sm text-muted underline underline-offset-4 hover:text-ink">
            Log out ({user.email})
          </button>
        </form>
      </div>

      <form action={createDeck} className="mb-10 flex max-w-md gap-2">
        <label className="sr-only" htmlFor="deck-name">
          New deck name
        </label>
        <input
          id="deck-name"
          name="name"
          placeholder="New deck name"
          required
          maxLength={100}
          className={field}
        />
        <button className={`${primaryButton} shrink-0`}>Add deck</button>
      </form>

      {decks.length === 0 ? (
        <p className="max-w-md text-muted">
          No decks yet. Name your first deck above, for example “English verbs”, then add cards to it.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const total = deck.cards.length;
            const due = deck.cards.filter((c) => c.nextReview <= now).length;

            return (
              <li
                key={deck.id}
                className="flex flex-col justify-between gap-6 rounded-lg border border-line bg-surface p-5"
              >
                <div className="min-w-0">
                  <Link
                    href={`/decks/${deck.id}`}
                    className="break-words font-display text-xl font-bold hover:underline"
                  >
                    {deck.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {total} {total === 1 ? "card" : "cards"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {due > 0 ? (
                    <Link href={`/decks/${deck.id}/study`} className={primaryButton}>
                      Study {due}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">Nothing due</span>
                  )}
                  <DeleteButton
                    action={deleteDeck}
                    id={deck.id}
                    itemName={deck.name}
                    consequence={
                      total > 0
                        ? `This also deletes ${total} ${total === 1 ? "card" : "cards"} in this deck. This can’t be undone.`
                        : "This can’t be undone."
                    }
                  />
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