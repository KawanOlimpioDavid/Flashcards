import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import ImportForm from "./import-form";

async function ImportContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deckId = Number(id);
  if (!Number.isInteger(deckId)) notFound();

  const user = await requireUser();
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
    select: { id: true, name: true, cards: { select: { front: true } } },
  });
  if (!deck) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={`/decks/${deck.id}`}
        className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Back to {deck.name}
      </Link>
      <h1 className="mt-2 font-display text-4xl font-bold">Import cards</h1>
      <p className="mt-1 max-w-xl text-muted">
        One card per line: the front, a separator, then the back. The separator is detected
        automatically (tab, semicolon, comma, dash or colon). Tip: you can copy cells from Excel or
        Google Sheets and paste them here.
      </p>

      <ImportForm deckId={deck.id} existingFronts={deck.cards.map((card) => card.front)} />
    </main>
  );
}

export default function ImportPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <ImportContent params={params} />
    </Suspense>
  );
}