export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]; // the index is the box number
export type Rating = "hard" | "medium" | "easy";

export function nextState(box: number, rating: Rating, now = new Date()) {
  const current = Math.min(Math.max(box, 1), 5);

  if (rating === "hard") {
    return { box: 1, nextReview: new Date(now.getTime() + 10 * 60 * 1000) };
  }

  const newBox = rating === "easy" ? Math.min(current + 1, 5) : current;
  const days = BOX_INTERVAL_DAYS[newBox];
  return { box: newBox, nextReview: new Date(now.getTime() + days * 24 * 60 * 60 * 1000) };
}