"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

type ActionResult = { ok?: boolean; error?: string } | undefined;

export async function createDeck(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 100) return;

  await prisma.deck.create({ data: { name, userId: user.id } });
  revalidatePath("/decks");
}

export async function deleteDeck(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "Invalid deck." };

  let count = 0;
  try {
    // "userId: user.id" makes sure you can only delete YOUR decks
    ({ count } = await prisma.deck.deleteMany({ where: { id, userId: user.id } }));
  } catch {
    return { error: "Could not delete the deck. Please try again." };
  }

  revalidatePath("/decks");
  return count > 0 ? { ok: true } : { error: "This deck no longer exists." };
}