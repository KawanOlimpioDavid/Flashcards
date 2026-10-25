"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { MAX_TEXT_LENGTH, parseCards } from "@/lib/import-cards";

type ImportResult = { ok?: boolean; added?: number; error?: string } | undefined;

export async function importCards(_prev: ImportResult, formData: FormData): Promise<ImportResult> {
  const user = await requireUser();
  const deckId = Number(formData.get("deckId"));
  const text = String(formData.get("text") ?? "");
  const separator = String(formData.get("separator") ?? "auto");
  const header = formData.get("header") === "on";

  if (!Number.isInteger(deckId)) return { error: "Invalid deck." };
  if (!text.trim()) return { error: "Paste some text or choose a file first." };
  if (text.length > MAX_TEXT_LENGTH) return { error: "The text is too long." };

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
    select: { id: true, cards: { select: { front: true } } },
  });
  if (!deck) return { error: "Deck not found." };

  const { cards } = parseCards(text, {
    separator,
    header,
    existingFronts: deck.cards.map((card) => card.front),
  });
  if (cards.length === 0) return { error: "There are no valid new cards to add." };

  try {
    await prisma.card.createMany({
      data: cards.map((card) => ({ front: card.front, back: card.back, deckId: deck.id })),
    });
  } catch {
    return { error: "Could not save the cards. Please try again." };
  }

  revalidatePath(`/decks/${deck.id}`);
  revalidatePath("/decks");
  return { ok: true, added: cards.length };
}