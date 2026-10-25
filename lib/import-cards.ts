export const MAX_ROWS = 500;
export const MAX_FRONT = 500;
export const MAX_BACK = 2000;
export const MAX_TEXT_LENGTH = 250_000;
export const MAX_FILE_BYTES = 250_000;

export const SEPARATORS = {
  tab: "\t",
  semicolon: ";",
  comma: ",",
  dash: " - ",
  colon: ":",
} as const;

export type SeparatorName = keyof typeof SEPARATORS;

export const SEPARATOR_LABELS: Record<SeparatorName, string> = {
  tab: "Tab",
  semicolon: "Semicolon",
  comma: "Comma",
  dash: "Dash",
  colon: "Colon",
};

export type Row = {
  line: number;
  front: string;
  back: string;
  reason: string | null; // null means the row is ready to be added
};

export type ParseResult = {
  separator: SeparatorName;
  rows: Row[];
  cards: { front: string; back: string }[];
};

// If several separators fit, the first one in this list wins
const DETECTION_ORDER: SeparatorName[] = ["tab", "semicolon", "dash", "colon", "comma"];

function detectSeparator(lines: string[]): SeparatorName {
  let best = DETECTION_ORDER[0];
  let bestCount = -1;
  for (const name of DETECTION_ORDER) {
    const count = lines.filter((line) => line.includes(SEPARATORS[name])).length;
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}

function clean(value: string): string {
  let v = value.trim();
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    v = v.slice(1, -1).replace(/""/g, '"').trim();
  }
  return v;
}

function splitLine(line: string, sep: string): [string, string] | null {
  // A quoted first field, like: "Korea, South",Seoul
  if (line.startsWith('"')) {
    let i = 1;
    while (i < line.length) {
      if (line[i] === '"') {
        if (line[i + 1] === '"') {
          i += 2;
          continue;
        }
        break;
      }
      i++;
    }
    const rest = line.slice(i + 1);
    if (rest.startsWith(sep)) {
      return [line.slice(0, i + 1), rest.slice(sep.length)];
    }
  }

  // Otherwise, split at the FIRST separator, so the back can contain more of them
  const index = line.indexOf(sep);
  if (index === -1) return null;
  return [line.slice(0, index), line.slice(index + sep.length)];
}

const key = (text: string) => text.normalize("NFC").toLowerCase();

export function parseCards(
  text: string,
  options: { separator: string; header: boolean; existingFronts: string[] },
): ParseResult {
  const entries = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((raw, i) => ({ raw: raw.trim(), line: i + 1 }))
    .filter((entry) => entry.raw !== "");

  const content = options.header ? entries.slice(1) : entries;

  const separator = Object.prototype.hasOwnProperty.call(SEPARATORS, options.separator)
    ? (options.separator as SeparatorName)
    : detectSeparator(content.map((entry) => entry.raw));
  const sep = SEPARATORS[separator];

  const existing = new Set(options.existingFronts.map(key));
  const seen = new Set<string>();
  const rows: Row[] = [];
  const cards: { front: string; back: string }[] = [];

  for (const { raw, line } of content) {
    const parts = splitLine(raw, sep);
    if (!parts) {
      rows.push({ line, front: raw, back: "", reason: "No separator found" });
      continue;
    }

    const front = clean(parts[0]);
    const back = clean(parts[1]);

    let reason: string | null = null;
    if (!front || !back) reason = "Front or back is empty";
    else if (front.length > MAX_FRONT) reason = `Front is longer than ${MAX_FRONT} characters`;
    else if (back.length > MAX_BACK) reason = `Back is longer than ${MAX_BACK} characters`;
    else if (existing.has(key(front))) reason = "Already in this deck";
    else if (seen.has(key(front))) reason = "Repeated in this list";
    else if (cards.length >= MAX_ROWS) reason = `Over the limit of ${MAX_ROWS} cards`;

    if (reason === null) {
      seen.add(key(front));
      cards.push({ front, back });
    }
    rows.push({ line, front, back, reason });
  }

  return { separator, rows, cards };
}