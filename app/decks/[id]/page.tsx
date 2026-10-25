import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { createCard, deleteCard } from "@/app/actions/cards";
import DeleteButton from "@/components/delete-button";
import { field, primaryButton, secondaryButton } from "@/lib/ui";

async function DeckContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deckId = Number(id);
  if (!Number.isInteger(deckId)) notFound();

  const user = await requireUser();
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
    include: { cards: { orderBy: { createdAt: "desc" } } },
  });
  if (!deck) notFound();

  const count = deck.cards.length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/decks"
        className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Back to decks
      </Link>

      <div className="mb-8 mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-display text-4xl font-bold">{deck.name}</h1>
          <p className="mt-1 text-muted">
            {count} {count === 1 ? "card" : "cards"}
          </p>
        </div>
                <div className="flex gap-3">
          <Link href={`/decks/${deck.id}/import`} className={secondaryButton}>
            Import cards
          </Link>
          {count > 0 && (
            <Link href={`/decks/${deck.id}/study`} className={primaryButton}>
              Study
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
        <section aria-labelledby="add-card" className="lg:sticky lg:top-6 lg:self-start">
          <h2 id="add-card" className="mb-3 font-display text-xl font-bold">
            Add a card
          </h2>
          <form
            action={createCard}
            className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4"
          >
            <input type="hidden" name="deckId" value={deck.id} />
            <label className="flex flex-col gap-1 text-sm">
              Front (question)
              <input name="front" required maxLength={500} className={field} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Back (answer)
              <textarea name="back" required maxLength={2000} rows={3} className={field} />
            </label>
            <button className={`${primaryButton} self-start`}>Add card</button>
          </form>
        </section>

        <section aria-labelledby="cards-heading">
          <h2 id="cards-heading" className="mb-3 font-display text-xl font-bold">
            Cards
          </h2>
          {count === 0 ? (
            <p className="max-w-md text-muted">
              No cards yet. Add the first one, for example “to run” and “correr”.
            </p>
          ) : (
            <ul className="border-t border-line">
              {deck.cards.map((card) => {
                const name = card.front.length > 40 ? `${card.front.slice(0, 40)}…` : card.front;

                return (
                  <li
                    key={card.id}
                    className="flex items-start justify-between gap-4 border-b border-line py-4"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-display text-lg font-bold">{card.front}</p>
                      <p className="whitespace-pre-wrap break-words text-muted">{card.back}</p>
                    </div>
                    <div className="flex shrink-0 items-center text-sm">
                      <Link
                        href={`/decks/${deck.id}/cards/${card.id}`}
                        className="inline-flex min-h-11 items-center px-3 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteCard}
                        id={card.id}
                        itemName={name}
                        consequence="This can’t be undone."
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <DeckContent params={params} />
    </Suspense>
  );
}