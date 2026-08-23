# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: parents/guardians of children enrolled or applying to Troy Adventist
Academy Preschool, filling out admission and student-related forms for their
child(ren) on a phone or laptop, often mid-task (at pickup, on a break,
between other errands) rather than at a dedicated desk session.

Secondary: school staff/admins reviewing submissions, answering parent
questions, and approving other staff for dashboard access. A super-admin
manages templates, the chatbot knowledge base, and admin approvals.

## Product Purpose

Digitizes the school's paper admission and student-related forms (schedule &
financial agreement, child information record, health appraisal, etc.) into
dynamic, fillable, e-signed online forms, replacing a paper/PDF workflow.
Success is a parent completing and signing a form correctly, with less
back-and-forth than the paper process, and staff having a clear, searchable
record of who has done what.

## Positioning

Not a generic form-builder SaaS — it is a bespoke digitization of this one
school's actual paper packet, so field lists, validation, and workflow (e.g.
"share with physician to complete the rest," per-field questions blocking
submission until resolved) match the real forms exactly rather than a
generic template a neighboring school could reuse as-is.

## Operating Context

- Parents sign in with a personal Google account; there is no separate
  password/account system.
- Everything past the branded landing page requires sign-in, including
  reading policy documents and downloading blank PDFs — this app is the
  school's private parent portal, not a public marketing brochure.
- Forms are often filled in short, interrupted sessions (draft-save is a
  core workflow, not an edge case).
- Some forms require a second, non-parent signer (e.g. a physician) reached
  via a scoped email-locked link — that person never creates an account.
- Staff access is gated behind super-admin approval; most visitors to the
  authenticated app are parents, not staff.

## Capabilities and Constraints

- Auth is Google Sign-In via Firebase only (no email/password, no other
  OAuth providers).
- Postgres (via Prisma) is the system of record for everything except auth
  identity/claims — Firebase custom claims are a hint, never the sole
  authorization check.
- E-signatures are captured natively (drawn/typed signature + IP + user
  agent + exact consent text), not via a third-party e-signature vendor.
  This is intentionally "electronic signature," not notarized/identity-
  verified — sufficient for internal school administrative forms.
- A parent's "Send" is blocked while any of their questions on that
  submission are unanswered/unwithdrawn — this gate is enforced server-side,
  not just in the UI.
- The in-app chatbot must answer only from a curated knowledge base and
  explicitly decline (pointing to the school office) rather than guess when
  the answer isn't in that knowledge base — a hard product constraint, not a
  style preference, since incorrect eligibility/instruction answers carry
  real consequences for families.

## Brand Commitments

- School name: "Troy Adventist Academy Preschool."
- Tagline: "A place for your child to Learn and Love and Grow."
- The landing page is described in the source brief as matching the cover
  page of the school's existing Parent Handbook (school name, tagline,
  address/phone, "Parent Handbook" heading) — that handbook is the
  incumbent brand reference, not yet supplied as an asset in this repo.

## Evidence on Hand

- Full functional/technical spec: `school-forms-platform-spec (1).md`
  (pasted into this project's history), including worked field-mapping
  examples for three real paper forms.
- No logo, photography, or handbook scan files are present in the repo yet
  — placeholder copy in `src/app/page.tsx` says so explicitly. Future work
  must not fabricate a school address/phone/logo; treat those as open until
  supplied.

## Product Principles

1. Parents' actual paper forms are the spec — field lists and workflow
   follow the real documents, not a generic forms-product pattern.
2. Nothing blocks a parent silently — every gate (open questions, missing
   signature, pending approval) surfaces a clear, specific reason.
3. Postgres + explicit server-side checks are the authority; client state
   (including Firebase claims) is a convenience, never trusted alone.
4. The chatbot's job is to reduce parents getting stuck, not to seem
   maximally capable — declining beats guessing.

## Accessibility & Inclusion

No standard was specified by the user; treat this as a family-facing form
product (broad age/tech-comfort range of parents) and default to solid
semantic HTML, keyboard operability, and color-contrast discipline rather
than a named compliance target, until told otherwise.
