"use client";

import { useState } from "react";
import { reviewCard } from "@/app/actions/cards";

export default function StudyCard({ id, front, back }: { id: number; front: string; back: string }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded border border-gray-600 p-6 text-center">
      <p className="text-xl font-medium">{front}</p>

      {showAnswer ? (
        <>
          <p className="mt-4 whitespace-pre-wrap text-gray-300">{back}</p>
          <form action={reviewCard} className="mt-6 flex justify-center gap-2">
            <input type="hidden" name="id" value={id} />
            <button name="rating" value="hard" className="rounded bg-red-600 px-4 py-2 text-white">
              Hard
            </button>
            <button name="rating" value="medium" className="rounded bg-yellow-600 px-4 py-2 text-white">
              Medium
            </button>
            <button name="rating" value="easy" className="rounded bg-green-600 px-4 py-2 text-white">
              Easy
            </button>
          </form>
        </>
      ) : (
        <button onClick={() => setShowAnswer(true)} className="mt-6 rounded bg-blue-600 px-4 py-2 text-white">
          Show answer
        </button>
      )}
    </div>
  );
}