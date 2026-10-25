import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { primaryButton } from "@/lib/ui";
import StudyCard from "./study-card";

async function Study({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deckId = Number(id);
  if (!Number.isInteger(deckId)) notFound();

  const user = await requireUser();
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
    select: { id: true, name: true },
  });
  if (!deck) notFound();

  const now = new Date();
  const [card, dueCount] = await Promise.all([
    prisma.card.findFirst({
      where: { deckId: deck.id, nextReview: { lte: now } },
      orderBy: { nextReview: "asc" },
    }),
    prisma.card.count({ where: { deckId: deck.id, nextReview: { lte: now } } }),
  ]);

  return (
    <main className="mx-auto max-w-xl px-8 py-10">
      <Link
        href={`/decks/${deck.id}`}
        className="text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Back to {deck.name}
      </Link>
      <h1 className="mb-1 mt-4 font-display text-3xl font-bold">{deck.name}</h1>
      <p className="mb-8 text-sm text-muted">
        {dueCount} {dueCount === 1 ? "card" : "cards"} due
      </p>

      {card ? (
        <StudyCard key={card.id} id={card.id} front={card.front} back={card.back} />
      ) : (
        <div>
          <p className="font-display text-xl font-bold">You’re done for now.</p>
          <p className="mt-2 text-muted">
            Rated cards come back on their schedule. Cards you rated Hard return in 10 minutes. You
            can add new cards at any time.
          </p>
          <Link href={`/decks/${deck.id}`} className={`${primaryButton} mt-6 inline-block`}>
            Add or edit cards
          </Link>
        </div>
      )}
    </main>
  );
}

export default function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <Study params={params} />
    </Suspense>
  );
}