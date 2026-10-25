# Flash

Flash is a flashcard web app with **spaced repetition**. You create decks, add cards (one by one or by importing a list), and study the cards that are due. After each card, you rate how well you remembered it, and the app schedules the next review for you.

It was built step by step as a learning project, with a full stack: front end, back end, database and authentication.

## Features

- **Accounts:** sign up, log in and log out with email and password. Each user only sees their own data.
- **Decks:** create decks, see how many cards each one has and how many are due today, and delete them.
- **Cards:** add, edit and delete cards inside a deck.
- **Study mode:** one card at a time, with a flip animation. Rate each card as *Hard*, *Medium* or *Easy*.
- **Spaced repetition:** a Leitner-box system schedules each review (see below).
- **Import cards:** paste a list or choose a `.txt`, `.csv` or `.tsv` file, check a live preview, and add many cards at once.
- **Safe deletion:** a confirmation dialog that names the item and, for decks, warns that the cards will also be deleted.
- **Design:** a yellow-and-black theme built on design tokens, a responsive layout, keyboard-friendly controls and support for reduced motion.

## Tech stack

| Area | Tools |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router, Server Components and Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS 4, CSS variables as design tokens, `next/font` (Atkinson Hyperlegible and Bricolage Grotesque) |
| Database | PostgreSQL |
| ORM | [Prisma](https://www.prisma.io/) 7 with the `pg` driver adapter |
| Authentication | Custom: passwords hashed with `bcryptjs`, sessions as signed tokens (`jose`) in a cookie |
| Tooling | Node.js, npm, ESLint, Git |

## Getting started

### Requirements

- Node.js 20.9 or newer (developed with Node.js 22)
- A recent PostgreSQL server (developed with PostgreSQL 18)
- Git

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/Flashcards.git
cd Flashcards
npm install
```

### 2. Create the database

Open the PostgreSQL console (for example, `sudo -u postgres psql`) and run:

```sql
CREATE USER flashcards_user WITH PASSWORD 'choose_a_password' CREATEDB;
CREATE DATABASE flashcards OWNER flashcards_user;
```

`CREATEDB` is needed because Prisma creates a temporary "shadow" database when you run migrations in development.

### 3. Configure the environment

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | What it is |
|---|---|
| `DATABASE_URL` | The PostgreSQL address, for example `postgresql://flashcards_user:choose_a_password@localhost:5432/flashcards` |
| `AUTH_SECRET` | A long random secret that signs the session cookies. Generate one with `openssl rand -base64 32` |

Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Create the tables and generate the Prisma client

```bash
npx prisma migrate dev
npx prisma generate
```

In Prisma 7, `migrate dev` does not generate the client automatically, so the second command is required. The generated client is saved in `generated/prisma`, which is not committed.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and add your first deck.

## Available commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the app for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Checks the code with ESLint |
| `npx tsc --noEmit` | Checks the TypeScript types |
| `npx prisma studio` | Opens a visual editor for the database |
| `npx prisma migrate dev --name <name>` | Creates and applies a migration after you change `prisma/schema.prisma` |

## How the study schedule works

Each card lives in a **box from 1 to 5**. The higher the box, the longer the wait before you see the card again.

| Box | Wait before the next review |
|---|---|
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 14 days |
| 5 | 30 days |

After you flip a card, you rate it:

- **Hard:** the card goes back to box 1 and returns in 10 minutes.
- **Medium:** the card stays in the same box and waits that box's time.
- **Easy:** the card moves up one box (up to box 5) and waits the new box's time.

New cards are due immediately. When no cards are due, the study screen says so. This is intentional: reviewing a card before it is due does not strengthen memory.

## Importing cards

Open a deck and click **Import cards**. Paste a list or choose a file. Use **one card per line**: the front, a separator, then the back.

```text
France; Paris
Brazil; Brasília
Japan; Tokyo
```

- **Separators:** tab, semicolon, comma, dash (` - `) or colon. The app detects the separator automatically, and you can choose it by hand. Tip: you can copy two columns from Excel or Google Sheets and paste them (they use tabs).
- **Splitting:** each line is split at the **first** separator, so the back can contain more separators, for example `to run; correr, fugir (past: ran)`.
- **Quotes:** a front in double quotes can contain the separator, for example `"Korea, South", Seoul`.
- **Header:** you can tick "The first line is a header" to skip it.
- **Preview:** the table shows each line as *Ready* or *skipped*, with the reason (no separator, empty front or back, text too long, repeated in the list, or already in the deck).
- **Limits:** up to 500 cards per import, a front up to 500 characters, a back up to 2000 characters, and a file up to 250 KB.
- **Encoding:** files are read as UTF-8, with a fallback to Windows-1252 for older Excel files, so accents such as in "Brasília" are kept.

Duplicates are detected by the front text (ignoring uppercase and lowercase). The server checks everything again before saving.

## Project structure

```text
app/
  actions/            Server Actions: auth, decks, cards and import
  decks/
    page.tsx          List of decks
    [id]/
      page.tsx        One deck: add, list, edit and delete cards
      cards/[cardId]/ Edit a card
      import/         Import cards from text or a file
      study/          Study mode (flip card and ratings)
  login/ signup/      Authentication pages
  globals.css         Design tokens, theme and card styles
  layout.tsx          Fonts, header and base layout
components/
  delete-button.tsx   Reusable delete button with a confirmation dialog
lib/
  dal.ts              Finds the logged-in user (requireUser)
  import-cards.ts     Parser for the import feature (used by browser and server)
  prisma.ts           Shared Prisma client
  session.ts          Creates, reads and deletes the session cookie
  srs.ts              Spaced repetition rules
  ui.ts               Shared Tailwind class names for fields and buttons
prisma/
  schema.prisma       Database models
  migrations/         Database migration history
prisma7.config.ts     Prisma 7 configuration
```

## Data model

- **User:** `id`, `email` (unique), `passwordHash`, `createdAt`
- **Deck:** `id`, `name`, `userId`, `createdAt`
- **Card:** `id`, `front`, `back`, `deckId`, `box`, `nextReview`, `createdAt`

Deleting a user's deck also deletes its cards (`onDelete: Cascade`).

## Security notes

- Passwords are hashed with bcrypt. The real password is never stored.
- Sessions are signed tokens stored in an `httpOnly` cookie (not readable by browser scripts), valid for 7 days, and marked `Secure` in production.
- Every Server Action checks on the server that the deck or card belongs to the logged-in user, so changing an ID in a request does not give access to someone else's data.
- Secrets live in `.env`, which is ignored by Git.

This project is **not ready to be a public service yet**. It has no email verification, no password reset and no limit on login attempts.

## Troubleshooting

**`password authentication failed` on Fedora or other Red Hat based systems**
PostgreSQL's default configuration uses `ident` authentication for local network connections, which does not accept passwords. In `pg_hba.conf`, change `ident` to `scram-sha-256` on the `127.0.0.1/32` and `::1/128` lines, then restart PostgreSQL:

```bash
sudo sed -i 's/ident$/scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql
```

**`Cannot find module` for `generated/prisma/client`**
Run `npx prisma generate`.

**Prisma 8 gets installed**
At the time this project was built, `npm install prisma` installed a Prisma 8 release candidate, which does not work with this project's `schema.prisma`. This project uses Prisma 7. Use `npm install` (which follows `package-lock.json`) and do not upgrade Prisma without checking the migration guide first.

## Roadmap

- [ ] Stacked deck covers, with customizable colors and patterns
- [ ] Search and sorting for decks
- [ ] Reverse cards (study both directions)
- [ ] Autofill cards from a dictionary
- [ ] Optional AI card generation, with a review step
- [ ] Password reset, email verification and login rate limiting
- [ ] Automated tests
- [ ] Deployment guide

## License

No license has been chosen yet. Add a `LICENSE` file before sharing the code publicly.
