import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { createCard, deleteCard } from "@/app/actions/cards";
import { field, primaryButton } from "@/lib/ui";

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
    <main className="mx-auto max-w-xl px-8 py-10">
      <Link href="/decks" className="text-sm text-muted underline underline-offset-4 hover:text-ink">
        Back to decks
      </Link>

      <div className="mb-8 mt-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{deck.name}</h1>
          <p className="text-sm text-muted">
            {count} {count === 1 ? "card" : "cards"}
          </p>
        </div>
        {count > 0 && (
          <Link href={`/decks/${deck.id}/study`} className={primaryButton}>
            Study
          </Link>
        )}
      </div>

      <form action={createCard} className="mb-8 flex flex-col gap-3">
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

      {count === 0 ? (
        <p className="text-muted">
          No cards yet. Add the first one above, for example “to run” and “correr”.
        </p>
      ) : (
        <ul className="border-t border-line">
          {deck.cards.map((card) => (
            <li key={card.id} className="flex items-start justify-between gap-4 border-b border-line py-4">
              <div>
                <p className="font-display text-lg font-bold">{card.front}</p>
                <p className="whitespace-pre-wrap text-muted">{card.back}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <Link
                  href={`/decks/${deck.id}/cards/${card.id}`}
                  className="underline underline-offset-4"
                >
                  Edit
                </Link>
                <form action={deleteCard}>
                  <input type="hidden" name="id" value={card.id} />
                  <button className="text-danger underline underline-offset-4">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
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