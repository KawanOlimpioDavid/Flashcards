"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export async function createDeck(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 100) return;

  await prisma.deck.create({ data: { name, userId: user.id } });
  revalidatePath("/decks");
}

export async function deleteDeck(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  // "userId: user.id" makes sure you can only delete YOUR decks
  await prisma.deck.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/decks");
}