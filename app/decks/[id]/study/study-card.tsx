"use client";

import { useState } from "react";
import { reviewCard } from "@/app/actions/cards";

export default function StudyCard({ id, front, back }: { id: number; front: string; back: string }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div>
      <div className="flip h-72" data-flipped={showAnswer}>
        <div className="flip-inner">
          <div
            className="flip-face ruled overflow-auto rounded-md pb-6 pl-[4.25rem] pr-8 pt-[4.8rem] shadow-lg"
            aria-hidden={showAnswer}
          >
            <p className="font-display text-3xl font-bold leading-[2.4rem] text-paper-ink">{front}</p>
          </div>
          <div
            className="flip-face flip-back ruled overflow-auto rounded-md pb-6 pl-[4.25rem] pr-8 pt-[2.4rem] shadow-lg"
            aria-hidden={!showAnswer}
          >
            <p className="whitespace-pre-wrap text-xl leading-[2.4rem] text-paper-ink">{back}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {showAnswer ? (
          <form action={reviewCard} className="flex flex-wrap gap-3">
            <input type="hidden" name="id" value={id} />
            <button
              name="rating"
              value="hard"
              className="rounded-md border border-danger px-5 py-2.5 font-bold text-danger"
            >
              Hard
            </button>
            <button
              name="rating"
              value="medium"
              className="rounded-md border border-ink px-5 py-2.5 font-bold"
            >
              Medium
            </button>
            <button
              name="rating"
              value="easy"
              className="rounded-md bg-accent px-5 py-2.5 font-bold text-accent-ink"
            >
              Easy
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="rounded-md bg-accent px-5 py-2.5 font-bold text-accent-ink"
          >
            Show answer
          </button>
        )}
      </div>
    </div>
  );
}