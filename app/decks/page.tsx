import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { createDeck, deleteDeck } from "@/app/actions/decks";
import { logout } from "@/app/actions/auth";

const inputClass =
  "rounded border border-gray-400 bg-white p-2 text-black placeholder-gray-500 dark:border-gray-600 dark:bg-neutral-900 dark:text-white dark:placeholder-gray-400";

async function Decks() {
  const user = await requireUser();
  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });

  return (
    <main className="mx-auto max-w-xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My decks</h1>
        <form action={logout}>
          <button className="text-sm underline">Log out ({user.email})</button>
        </form>
      </div>

      <form action={createDeck} className="mb-6 flex gap-2">
        <input
          name="name"
          placeholder="New deck name"
          required
          maxLength={100}
          className={`flex-1 ${inputClass}`}
        />
        <button className="rounded bg-blue-600 px-4 text-white">Add</button>
      </form>

      {decks.length === 0 ? (
        <p>No decks yet. Create your first one!</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {decks.map((deck) => (
            <li
              key={deck.id}
              className="flex items-center justify-between rounded border border-gray-600 p-3"
            >
              <span>
                <Link href={`/decks/${deck.id}`} className="underline">
                  {deck.name}
                </Link>{" "}
                <span className="text-sm text-gray-400">({deck._count.cards} {deck._count.cards === 1 ? "card" : "cards"})</span>
              </span>
              <form action={deleteDeck}>
                <input type="hidden" name="id" value={deck.id} />
                <button className="text-sm text-red-500">Delete</button>
              </form>
            </li>
          ))}
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