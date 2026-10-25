"use client";

import { useState } from "react";
import { reviewCard } from "@/app/actions/cards";
import { primaryButton, secondaryButton } from "@/lib/ui";

function sizeClass(text: string) {
  const n = text.length;
  if (n <= 30) return "text-3xl sm:text-4xl";
  if (n <= 90) return "text-xl sm:text-2xl";
  if (n <= 220) return "text-lg";
  return "text-base";
}

function Face({
  label,
  text,
  hidden,
  back,
}: {
  label: string;
  text: string;
  hidden: boolean;
  back?: boolean;
}) {
  return (
    <div
      className={`flip-face flashcard-face ${back ? "flip-back" : "flip-front"}`}
      aria-hidden={hidden}
    >
      <span className="absolute left-4 top-3 z-10 text-xs font-bold opacity-70">{label}</span>
      <div className="flex h-full overflow-auto rounded-[14px] px-6 pb-6 pt-10 sm:px-8">
        <p
          className={`m-auto max-w-full whitespace-pre-wrap break-words text-center font-display font-bold leading-snug ${sizeClass(text)}`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

export default function StudyCard({ id, front, back }: { id: number; front: string; back: string }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div>
      <div className="flip h-72 sm:h-80" data-flipped={showAnswer}>
        <div className="flip-inner">
          <Face label="Question" text={front} hidden={showAnswer} />
          <Face label="Answer" text={back} hidden={!showAnswer} back />
        </div>
      </div>

      <div className="mt-6">
        {showAnswer ? (
          <form action={reviewCard} className="grid grid-cols-3 gap-3">
            <input type="hidden" name="id" value={id} />
            <button name="rating" value="hard" className={`${secondaryButton} text-danger`}>
              Hard
            </button>
            <button name="rating" value="medium" className={secondaryButton}>
              Medium
            </button>
            <button name="rating" value="easy" className={primaryButton}>
              Easy
            </button>
          </form>
        ) : (
          <button onClick={() => setShowAnswer(true)} className={`${primaryButton} w-full sm:w-auto`}>
            Show answer
          </button>
        )}
      </div>
    </div>
  );
}