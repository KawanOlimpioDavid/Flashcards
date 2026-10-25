import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { createCard, deleteCard } from "@/app/actions/cards";

const inputClass =
  "rounded border border-gray-400 bg-white p-2 text-black placeholder-gray-500 dark:border-gray-600 dark:bg-neutral-900 dark:text-white dark:placeholder-gray-400";

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

  return (
    <main className="mx-auto max-w-xl p-8">
      <Link href="/decks" className="text-sm underline">
        ← Back to decks
      </Link>
      <h1 className="mb-1 mt-4 text-2xl font-bold">{deck.name}</h1>
      <p className="mb-6 text-sm text-gray-400">{deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}</p>
      <Link href={`/decks/${deck.id}/study`} className="mb-6 inline-block rounded bg-green-600 px-4 py-2 text-white">Study</Link>
      <form action={createCard} className="mb-8 flex flex-col gap-3">
        <input type="hidden" name="deckId" value={deck.id} />
        <input name="front" placeholder="Front (question)" required maxLength={500} className={inputClass} />
        <textarea name="back" placeholder="Back (answer)" required maxLength={2000} rows={3} className={inputClass} />
        <button className="rounded bg-blue-600 p-2 text-white">Add card</button>
      </form>

      {deck.cards.length === 0 ? (
        <p>No cards yet. Add your first one above!</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deck.cards.map((card) => (
            <li key={card.id} className="flex items-start justify-between gap-4 rounded border border-gray-600 p-3">
              <div>
                <p className="font-medium">{card.front}</p>
                <p className="whitespace-pre-wrap text-sm text-gray-400">{card.back}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/decks/${deck.id}/cards/${card.id}`} className="text-sm underline">
                  Edit
                </Link>
                <form action={deleteCard}>
                  <input type="hidden" name="id" value={card.id} />
                  <button className="text-sm text-red-500">Delete</button>
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