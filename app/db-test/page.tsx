import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

async function Counts() {
  await connection();
  const users = await prisma.user.count();
  const decks = await prisma.deck.count();
  return <p>Users: {users} | Decks: {decks}</p>;
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Counts />
    </Suspense>
  );
}