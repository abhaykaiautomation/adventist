# Troy Adventist Academy Preschool — Digital Forms Platform

Full-stack Next.js app implementing `school-forms-platform-spec (1).md`. Parents sign
in with Google, fill out admission/student forms, sign electronically, and ask
questions inline; school staff get an admin dashboard after super-admin approval;
a knowledge-base-grounded chatbot helps parents while they fill out forms.

## Stack

Next.js 16 (App Router) · Tailwind CSS · React Hook Form + Zod · Firebase Auth
(Google Sign-In) · PostgreSQL + Prisma 7 (driver-adapter mode, `pg`) · pdf-lib ·
Claude (Anthropic SDK) + Voyage AI embeddings + pgvector for the RAG chatbot.

## Setup

1. **Install dependencies** — already done if you're reading this from the
   scaffolded repo: `npm install`.
2. **Fill in `.env`** (copy from `.env.example` if starting fresh):
   - `DATABASE_URL` / `DIRECT_DATABASE_URL` — the Hostinger Postgres instance
     (see the connection notes in `.env.example` about PgBouncer port 6432 vs
     the direct port for migrations).
   - `NEXT_PUBLIC_FIREBASE_*` — from your Firebase project's web app config.
   - `FIREBASE_ADMIN_*` — a Firebase service account (Project Settings →
     Service Accounts → Generate new private key). Keep `\n` literal in
     `FIREBASE_ADMIN_PRIVATE_KEY` — the app unescapes it at runtime.
   - `ANTHROPIC_API_KEY` — for the chatbot's chat completion.
   - `VOYAGE_API_KEY` — for the chatbot's embeddings (Anthropic doesn't offer
     its own embeddings endpoint; Voyage is their recommended partner).
3. **Enable pgvector** on the database once, before migrating:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. **Run the first migration**: `npm run prisma:migrate` (uses `DATABASE_URL`;
   swap in the direct/non-pooled URL first if your pooler doesn't support DDL).
5. **Seed starter content**: `npm run prisma:seed` — creates the three forms
   from the spec's worked examples (Schedule & Financial Agreement, Child
   Information Record, Health Appraisal) and placeholder policy pages (Safe
   Sleep, Medication, General Info). **Replace the placeholder policy HTML and
   verify the form field lists against the real scanned forms before going
   live** — the seed data is a structural starting point, not final content.
6. **Bootstrap the first super-admin**: there's no UI for this yet (see
   "What's left" below) — after signing in once, manually update that user's
   row in Postgres: `role = 'SUPER_ADMIN'`, `status = 'APPROVED'`. Every
   subsequent admin goes through the in-app request/approve flow.
7. `npm run dev` and visit `http://localhost:3000`.

## What's implemented

- **Landing page** (public) → Google Sign-In → everything else behind auth,
  enforced by `src/proxy.ts` (Next 16's middleware convention) plus
  server-side re-verification on every page/route (`src/lib/auth/server.ts`).
- **Forms**: dynamic renderer from `FormTemplate.schemaJson`, Save as Draft /
  Send with the open-question submission gate, per-field "ask a question"
  threads, e-signature capture, blank/draft/submitted PDF export (one
  pipeline, watermark driven by status).
- **Policies**: nav-driven list, optional per-policy acknowledgment,
  timestamped per parent/version.
- **Multi-signer forms** (e.g. Health Appraisal): sections tagged
  `audience: "PHYSICIAN"` in `schemaJson` are hidden from the parent's view;
  after the parent signs their part, they generate a `FormShareLink` and the
  physician completes the rest at `/share/[token]` — no account required,
  gated by token + email confirmation (a simplified stand-in for full
  email-OTP — see "What's left").
- **Admin dashboard**: parent directory, all-visitors log, submission queue
  with CSV export, open-questions queue, inline "request changes" (flips a
  submission to `NEEDS_CHANGES`), activity timeline, admin
  request/approve/revoke flow with Firebase custom claims.
- **Chatbot**: `KnowledgeBaseDoc` CRUD + chunking + embedding
  (`src/lib/rag/knowledgeBase.ts`), pgvector retrieval, Claude answering with
  a "context-only, decline if unsure" system prompt, floating widget on every
  form page, every Q&A logged to `ActivityLog`.
- **Visitor logging**: one `VisitLog` row per new browser session (not per
  navigation), per the spec.

## What's left / deliberately simplified

- **Placeholder content**: policy page HTML and the school's address/phone on
  the landing page are placeholders — swap in the real handbook text and
  school details.
- **Email delivery**: nothing sends real emails yet (SendGrid env vars are
  present but unused) — admin-status-change notifications, submission
  notifications, and the physician share-link are all TODO-marked in the
  route handlers; the share link is currently just displayed for the parent
  to copy/send manually.
- **Share-link access control** is a simplified two-factor check (token +
  exact email match), not full email-OTP — fine for an MVP, worth hardening
  before handling real health data at scale.
- **RateCard**: the model exists (`schoolYear`/`room`/`scheduleType`/
  `daysPerWeek` → `monthlyRate`) but nothing populates or reads it yet — the
  Schedule & Financial Agreement form doesn't compute a rate server-side yet.
- **First super-admin bootstrap** is a manual DB update (step 6 above) — no
  seed/CLI for it.
- **File uploads** (birth certificate, prior report card, etc.) aren't wired
  up — Firebase Storage was in the original stack table but no upload field
  type or storage integration exists yet.
- **Notifications** (Firebase Cloud Messaging) are unimplemented.

## Useful commands

```
npm run dev              # local dev server
npm run build             # production build (also type-checks)
npm run lint               # ESLint
npm run prisma:generate    # regenerate the Prisma client after schema edits
npm run prisma:migrate     # create/apply a migration
npm run prisma:seed        # re-run prisma/seed.ts
```
