import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { updateCard } from "@/app/actions/cards";

const inputClass =
  "rounded border border-gray-400 bg-white p-2 text-black placeholder-gray-500 dark:border-gray-600 dark:bg-neutral-900 dark:text-white dark:placeholder-gray-400";

async function EditCard({ params }: { params: Promise<{ id: string; cardId: string }> }) {
  const { id, cardId } = await params;
  const deckId = Number(id);
  const cid = Number(cardId);
  if (!Number.isInteger(deckId) || !Number.isInteger(cid)) notFound();

  const user = await requireUser();
  const card = await prisma.card.findFirst({
    where: { id: cid, deckId, deck: { userId: user.id } },
  });
  if (!card) notFound();

  return (
    <main className="mx-auto max-w-xl p-8">
      <Link href={`/decks/${deckId}`} className="text-sm underline">
        ← Back to deck
      </Link>
      <h1 className="mb-6 mt-4 text-2xl font-bold">Edit card</h1>

      <form action={updateCard} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={card.id} />
        <input name="front" defaultValue={card.front} required maxLength={500} className={inputClass} />
        <textarea name="back" defaultValue={card.back} required maxLength={2000} rows={4} className={inputClass} />
        <button className="rounded bg-blue-600 p-2 text-white">Save changes</button>
      </form>
    </main>
  );
}

export default function EditCardPage({
  params,
}: {
  params: Promise<{ id: string; cardId: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <EditCard params={params} />
    </Suspense>
  );
}