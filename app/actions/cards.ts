"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export async function createCard(formData: FormData) {
  const user = await requireUser();
  const deckId = Number(formData.get("deckId"));
  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();

  if (!Number.isInteger(deckId) || !front || !back) return;
  if (front.length > 500 || back.length > 2000) return;

  // Make sure the deck belongs to the logged-in user
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
    select: { id: true },
  });
  if (!deck) return;

  await prisma.card.create({ data: { front, back, deckId: deck.id } });
  revalidatePath(`/decks/${deck.id}`);
  revalidatePath("/decks");
}

export async function deleteCard(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  // Only find the card if its deck belongs to the logged-in user
  const card = await prisma.card.findFirst({
    where: { id, deck: { userId: user.id } },
    select: { id: true, deckId: true },
  });
  if (!card) return;

  await prisma.card.delete({ where: { id: card.id } });
  revalidatePath(`/decks/${card.deckId}`);
  revalidatePath("/decks");
}