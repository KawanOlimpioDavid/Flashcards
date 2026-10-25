"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { importCards } from "@/app/actions/import";
import {
  MAX_FILE_BYTES,
  MAX_TEXT_LENGTH,
  SEPARATOR_LABELS,
  parseCards,
} from "@/lib/import-cards";
import { field, primaryButton } from "@/lib/ui";

const EXAMPLE = "France; Paris\nBrazil; Brasília\nJapan; Tokyo";
const SHOWN_ROWS = 100;

async function readFile(file: File) {
  const buffer = await file.arrayBuffer();
  let text = new TextDecoder("utf-8").decode(buffer);
  // Old Excel files are often not UTF-8: try the other common encoding
  if (text.includes("\uFFFD")) text = new TextDecoder("windows-1252").decode(buffer);
  return text;
}

export default function ImportForm({
  deckId,
  existingFronts,
}: {
  deckId: number;
  existingFronts: string[];
}) {
  const [text, setText] = useState("");
  const [separator, setSeparator] = useState("auto");
  const [header, setHeader] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(importCards, undefined);

  const result = useMemo(
    () => parseCards(text, { separator, header, existingFronts }),
    [text, separator, header, existingFronts],
  );

  const ready = result.cards.length;
  const skipped = result.rows.length - ready;
  const tooLong = text.length > MAX_TEXT_LENGTH;

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|csv|tsv)$/i.test(file.name)) {
      setFileError("Choose a .txt, .csv or .tsv file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("The file is too big (maximum 250 KB).");
      return;
    }
    setFileError(null);
    setText(await readFile(file));
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="deckId" value={deckId} />

        <label className="flex flex-col gap-1 text-sm">
          Paste your list
          <textarea
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder={EXAMPLE}
            className={`${field} font-mono`}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Or choose a file (.txt, .csv or .tsv, up to 250 KB)
          <input
            type="file"
            accept=".txt,.csv,.tsv,text/plain,text/csv"
            onChange={onFileChange}
            className="min-h-11 text-sm file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-md file:border-0 file:bg-surface-2 file:px-4 file:font-bold file:text-ink"
          />
        </label>
        {fileError && (
          <p role="alert" className="text-danger">
            {fileError}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Separator
          <select
            name="separator"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className={field}
          >
            <option value="auto">Detect automatically</option>
            <option value="tab">Tab</option>
            <option value="semicolon">Semicolon ( ; )</option>
            <option value="comma">Comma ( , )</option>
            <option value="dash">Dash ( - )</option>
            <option value="colon">Colon ( : )</option>
          </select>
        </label>

        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="header"
            checked={header}
            onChange={(e) => setHeader(e.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          The first line is a header (skip it)
        </label>

        {tooLong && (
          <p role="alert" className="text-danger">
            The text is too long. Split it into smaller lists.
          </p>
        )}
        {state?.error && (
          <p role="alert" className="text-danger">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p role="status">
            Added {state.added} {state.added === 1 ? "card" : "cards"}.{" "}
            <Link href={`/decks/${deckId}`} className="underline underline-offset-4">
              Go to the deck
            </Link>
          </p>
        )}

        <button disabled={pending || ready === 0 || tooLong} className={`${primaryButton} self-start`}>
          {pending ? "Adding..." : `Add ${ready} ${ready === 1 ? "card" : "cards"}`}
        </button>
      </form>

      <section aria-labelledby="preview-heading">
        <h2 id="preview-heading" className="mb-1 font-display text-xl font-bold">
          Preview
        </h2>

        {result.rows.length === 0 ? (
          <p className="text-muted">Your cards will appear here as soon as you paste a list.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">
              Separator: {SEPARATOR_LABELS[result.separator]}. {ready} ready, {skipped} skipped.
            </p>
            <div className="max-h-[32rem] overflow-auto rounded-lg border border-line">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface-2">
                  <tr>
                    <th className="px-3 py-2">Line</th>
                    <th className="px-3 py-2">Front</th>
                    <th className="px-3 py-2">Back</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, SHOWN_ROWS).map((row) => (
                    <tr key={row.line} className="border-t border-line align-top">
                      <td className="px-3 py-2 text-muted">{row.line}</td>
                      <td className="break-words px-3 py-2">{row.front}</td>
                      <td className="break-words px-3 py-2">{row.back}</td>
                      <td className={`px-3 py-2 ${row.reason ? "text-danger" : ""}`}>
                        {row.reason ?? "Ready"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.rows.length > SHOWN_ROWS && (
              <p className="mt-2 text-sm text-muted">
                Showing the first {SHOWN_ROWS} lines. All {ready} ready cards will be added.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}