import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { updateCard } from "@/app/actions/cards";
import { field, primaryButton } from "@/lib/ui";

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
    <main className="mx-auto max-w-xl px-8 py-10">
      <Link
        href={`/decks/${deckId}`}
        className="text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Back to deck
      </Link>
      <h1 className="mb-6 mt-4 font-display text-3xl font-bold">Edit card</h1>

      <form action={updateCard} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={card.id} />
        <label className="flex flex-col gap-1 text-sm">
          Front (question)
          <input name="front" defaultValue={card.front} required maxLength={500} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Back (answer)
          <textarea
            name="back"
            defaultValue={card.back}
            required
            maxLength={2000}
            rows={4}
            className={field}
          />
        </label>
        <button className={`${primaryButton} self-start`}>Save changes</button>
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