import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
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
    <main className="mx-auto max-w-xl p-8">
      <Link href={`/decks/${deck.id}`} className="text-sm underline">
        ← Back to {deck.name}
      </Link>
      <h1 className="mb-1 mt-4 text-2xl font-bold">Study: {deck.name}</h1>
      <p className="mb-6 text-sm text-gray-400">{dueCount} due</p>

      {card ? (
        <StudyCard key={card.id} id={card.id} front={card.front} back={card.back} />
      ) : (
        <p>Nothing to review right now. Come back later!</p>
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