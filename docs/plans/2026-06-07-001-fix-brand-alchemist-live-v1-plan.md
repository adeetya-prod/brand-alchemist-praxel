---
title: "fix: Brand Alchemist live v1 — auth, form legibility, creative brief enrichment, generation reliability"
date: 2026-06-07
status: active
depth: standard
---

# fix: Brand Alchemist Live v1 — Auth, Form Legibility, Creative Brief & Generation Reliability

## Summary

Five issues discovered from live user testing at `brand-alchemist-prakel.vercel.app`. A server crash blocks all authenticated routes; auth pages are stuck in the old light-mode design; form inputs are invisible on dark backgrounds; creative generation never completes because Inngest isn't wired to Vercel; and the creative brief only offers a freeform textarea where structured CTA, tone, and intent inputs belong.

---

## Problem Frame

| # | Issue | Symptom |
|---|---|---|
| 1 | `/brands` 500 error | Authenticated users see "This page couldn't load" immediately after sign-in |
| 2 | Auth pages: old light UI | Sign-in and sign-up are white/gray — inconsistent with dark premium design |
| 3 | Form input contrast | URL input placeholder is invisible; other inputs likely affected |
| 4 | Creative generation silent failure | Jobs queue, never complete, library stays blank |
| 5 | Thin creative brief | Single optional textarea — no CTA, tone, or intent |

---

## Requirements

- R1: `/brands` and all authenticated routes load without 500 errors on Vercel
- R2: Sign-in and sign-up pages match the dark premium aesthetic of the dashboard
- R3: All form inputs in dark-background contexts have legible text and placeholder color
- R4: Creative generation completes end-to-end on Vercel — images appear in the library
- R5: Creative brief collects CTA, tone, and campaign intent as structured required fields
- R6: CTA, tone, and intent are stored on the Creative record (queryable, displayable)
- R7: Creative library shows an informative empty state, not a blank dark page

---

## Key Technical Decisions

**KTD1: Brief fields as DB columns**
`ctaLabel`, `tone`, and `intent` are added as nullable columns on `Creative`. This lets the library display what settings produced each image and enables future filtering. Encoding only into the prompt string was rejected — settings aren't recoverable or displayable after generation.

**KTD2: Inngest cloud (free tier) for Vercel background jobs**
Vercel serverless functions can't run persistent workers. Inngest Cloud dispatches jobs by calling back to `/api/inngest` on the Vercel deployment. Requires account creation, signing key, event key, and a sync step in the Inngest dashboard.

**KTD3: Shared dark-input style constants in `lib/styles.ts`**
A single source of truth for the dark-input Tailwind class string and inline style object, matching the `I`/`S` pattern established in `Step1Identity.tsx`. Applied everywhere inputs appear on dark backgrounds to prevent future drift.

---

## Scope Boundaries

### In scope
- Fix `/brands` 500 error — env parity, Supabase redirect URL, DB connection
- Redesign sign-in and sign-up to dark premium theme
- Fix form input legibility (URL extractor, audit others)
- Inngest cloud setup for production creative generation
- Creative brief structured fields (CTA, tone, intent) + Prisma migration
- Creative library empty state and FAILED card state

### Deferred to Follow-Up Work
- Creative variant comparison view
- CTA/tone/intent filtering in the creative library
- Advanced brand analytics dashboard
- Retry UI for failed creatives (FAILED card shown, retry is manual re-submit for now)

---

## Implementation Units

### U1. Fix `/brands` 500 error and Vercel env parity

**Goal:** All authenticated routes load reliably. Root causes: Supabase auth redirect URL not allowlisted for the Vercel domain; env vars may rely on the committed `.env` rather than the Vercel dashboard; Prisma pg Pool silently fails if `DATABASE_URL` is missing at runtime.

**Requirements:** R1

**Dependencies:** none

**Files:**
- `lib/supabase/server.ts` — verify cookie handling for Vercel serverless
- `app/(dashboard)/brands/page.tsx` — surface error details during diagnosis
- Vercel dashboard (Settings → Environment Variables) — add all required vars explicitly
- Supabase dashboard (Authentication → URL Configuration → Redirect URLs) — add Vercel domain

**Approach:**
- Check Vercel function logs (Vercel → Project → Functions tab) to identify the exact 500 cause: Prisma connection refused, Supabase session unresolved, or unhandled exception
- Add `https://brand-alchemist-prakel.vercel.app/**` to Supabase auth redirect URL allowlist — sign-up email confirmation links will otherwise redirect to a blocked URL
- Set these env vars explicitly in the Vercel dashboard for all environments (Production, Preview, Development):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (Transaction pooler, port 6543)
  - `DIRECT_URL` (Direct connection, port 5432)
  - `OPENAI_API_KEY`
  - `CF_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
- Add `.env` to `.gitignore` and update `.env.example` with placeholders — the live password in the committed `.env` is a credential exposure risk
- Trigger a fresh Vercel deployment after env vars are set; verify `/brands` returns 200

**Test scenarios:**
- `/brands` as authenticated user → 200, brands list renders
- `/brands` as unauthenticated user → redirect to `/sign-in`
- Sign in → redirect to `/brands`, page loads (no 500)
- Cold-start request (first hit after deploy) → `/brands` still loads without DB error
- Email confirmation link from sign-up → resolves to `/auth/callback` on the Vercel domain

**Verification:** Vercel function logs show no DB or Supabase errors. `/brands` returns 200 consistently across cold and warm starts.

---

### U2. Redesign sign-in and sign-up pages to dark premium theme

**Goal:** Replace old light-mode auth pages with dark premium styling matching the dashboard.

**Requirements:** R2

**Dependencies:** U1 (auth must work — redesign is cosmetic but pointless if sign-in is broken)

**Files:**
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

**Approach:**
- Remove `bg-gray-50` background — replace with a dark full-screen wrapper (`#0a0a14` or a CSS var matching the dashboard root background)
- Replace the white card (`bg-white border-gray-200`) with the dark glass-card pattern: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.09)`, `border-radius: 1.25rem`, `padding: 2rem`
- Replace `text-gray-900` headings → `text-white`; `text-gray-500` subtitles → `text-white/45`; `text-gray-700` labels → `text-white/70`
- Replace `border-gray-300` inputs → dark input pattern (from `DARK_INPUT_CLASS`/`DARK_INPUT_STYLE` added in U3)
- Replace error state `bg-red-50 text-red-600 border-red-200` → `background: rgba(255,107,107,0.12)`, `color: #FF6B6B`, `border: 1px solid rgba(255,107,107,0.25)`
- Replace the submit button with the gradient button style: `background: linear-gradient(135deg, #7C3AED, #FF6B6B)`
- Add a "Brand Alchemist" wordmark above the card (text logo, matching the nav)
- The sign-up email-verification success state (`verifying === true`) also gets dark styling
- All Supabase auth logic, field names, and routing remain unchanged

**Patterns to follow:** `components/brand-wizard/Step1Identity.tsx` for input styling; `app/(dashboard)/brands/[brandId]/creatives/new/page.tsx` for card layout.

**Test scenarios:**
- Sign-in page renders with dark background — no white flash or gray area
- All inputs are legible (white text, white/25 placeholder)
- Error message is readable on dark background
- "Sign up" link navigates correctly
- Sign-up → email verification success state is also dark-themed
- Mobile (375px): card is centered, padded, fully legible
- Gradient submit button matches the dashboard's action button style

**Verification:** No `bg-white`, `bg-gray-50`, `text-gray-*`, or `border-gray-*` classes remain on either auth page. Dark theme is visually consistent with the dashboard on all screen sizes.

---

### U3. Fix form input legibility across the app

**Goal:** Extract a shared dark-input style constant and apply it to all inputs/textareas rendered on dark backgrounds. Fixes the invisible URL input immediately and prevents future regressions.

**Requirements:** R3

**Dependencies:** none (can run in parallel with U2)

**Files:**
- `lib/styles.ts` (new) — shared dark input class string and style object
- `components/upload/WebsiteUrlExtractor.tsx` — URL input uses `border border-gray-300` with no white text
- `components/upload/FileUploader.tsx` — audit for light-mode input classes
- `components/upload/PdfUploadExtractor.tsx` — audit
- `components/brand/BrandEditForm.tsx` — audit

**Approach:**
- Create `lib/styles.ts` exporting:
  ```
  DARK_INPUT_CLASS  — Tailwind className string
  DARK_INPUT_STYLE  — inline style object
  ```
  Values match `Step1Identity.tsx`'s `I` and `S` constants:
  - Class: `w-full px-4 py-3 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm`
  - Style: `{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }`
- `WebsiteUrlExtractor.tsx`: the `<input type="url">` at line 43 currently uses `border border-gray-300 rounded-lg px-3 py-2` — replace with `DARK_INPUT_CLASS` + `DARK_INPUT_STYLE`
- Audit each upload and edit component for `border-gray-*`, `text-gray-*`, or unstyled background on inputs/textareas in dark-background contexts; apply the constants where found
- Auth pages (U2) also use these constants once created

**Patterns to follow:** `components/brand-wizard/Step1Identity.tsx` — the established gold standard.

**Test scenarios:**
- Website URL input: placeholder is visible at ~25% white opacity
- Typing into URL input: text is white and fully legible
- After fixing, visual appearance matches the brief textarea in `CreativeRequestForm.tsx`
- Brand edit form inputs (if audited and fixed) are legible

**Verification:** No `border-gray-300` or unstyled-background inputs remain on any page rendered inside the dark dashboard layout. The website URL placeholder is visible in a screenshot.

---

### U4. Enrich creative brief with CTA, tone, and intent fields

**Goal:** Replace the single optional freeform brief textarea with structured required selectors for CTA, tone, and campaign intent, plus an optional additional context field. Store these values on the Creative record.

**Requirements:** R5, R6

**Dependencies:** none (schema migration is independent)

**Files:**
- `prisma/schema.prisma` — add `ctaLabel String?`, `tone String?`, `intent String?` to `Creative`
- `prisma/migrations/` — new migration (`prisma migrate dev --name add-creative-brief-fields`)
- `components/creatives/CreativeRequestForm.tsx` — replace brief textarea with structured form
- `app/actions/creatives.ts` — update schema and action to accept + persist new fields
- `lib/prompts.ts` — update `buildPrompt()` to incorporate CTA, tone, intent

**Approach:**

*Schema:* Three nullable strings on `Creative` for backward compat with existing rows:
- `ctaLabel String?` — the button label the ad viewer will see
- `tone String?` — creative visual tone
- `intent String?` — campaign goal

*UI form structure* (replaces current optional `Creative Brief` textarea):
1. **CTA Button** — single-select pill group (required). Options: Learn More · Shop Now · Sign Up · Book a Demo · Get Started · Download Now · Contact Us
2. **Creative Tone** — single-select pill group (required). Options: Professional · Playful · Bold · Minimal · Urgent · Inspirational
3. **Campaign Goal** — single-select pill group (required). Options: Brand Awareness · Drive Sales · Event Promotion · Lead Generation · Customer Retention · Product Launch
4. **Additional Context** — small textarea (optional, max 300 chars). Replaces the old brief field; character counter shown.

The submit button remains disabled until all three required groups have a selection.

*Prompt builder:* `buildPrompt()` receives `ctaLabel`, `tone`, `intent`, optional `additionalContext`. Inject:
- `"Campaign goal: ${intent}."`
- `"Creative tone: ${tone} — convey through composition, lighting, and color temperature."`
- `"Reserve a clear area for a '${ctaLabel}' CTA button overlay."`
- `additionalContext` appended when provided.

*Action update:* `BatchRequestSchema` adds `ctaLabel z.string()`, `tone z.string()`, `intent z.string()`, `additionalContext z.string().max(300).optional()`. `requestBatchCreativeGeneration` persists these on each `Creative` record and passes them to `buildPrompt()`.

**Patterns to follow:** Existing format-selector pill buttons in `CreativeRequestForm.tsx` for the pill-group interaction pattern.

**Test scenarios:**
- Submit button disabled until CTA + tone + intent all selected
- Selecting a pill in a group deselects the previous selection in that group
- Additional context field accepts up to 300 chars and shows a live counter
- Submitting creates `Creative` records with `ctaLabel`, `tone`, `intent` populated
- Generated `prompt` column includes all three values (check via Prisma Studio)
- Existing Creative records with null `ctaLabel/tone/intent` still render in the library without error
- Brief fields for variant 0 and variant 1 are the same CTA/tone/intent, only `variantIndex` differs

**Verification:** `prisma studio` shows `ctaLabel`, `tone`, `intent` on new Creative records. The `/brands/[id]/creatives/new` form requires all three fields before enabling submit.

---

### U5. Wire Inngest cloud for end-to-end creative generation on Vercel

**Goal:** Creative jobs triggered on Vercel actually complete. Images appear in the library. Creative library shows an informative empty state rather than a blank page.

**Requirements:** R4, R7

**Dependencies:** U1 (Vercel accessible), U4 (new brief fields in event payload)

**Files:**
- `app/api/inngest/route.ts` — verify all three functions are registered
- `app/inngest/generate-creative.ts` — read `ctaLabel/tone/intent` from event; pass to `buildPrompt`
- `app/actions/creatives.ts` — include new brief fields in the Inngest event payload
- `components/creatives/CreativesGrid.tsx` — add empty state and FAILED card
- `components/creatives/CreativeCard.tsx` — add FAILED visual state

**Approach:**

*Inngest cloud setup (deployment steps):*
1. Create an account at `inngest.com` → New App → copy **Event Key** and **Signing Key**
2. Add `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` to Vercel env vars (Production + Preview)
3. Remove the `local` placeholder values for these keys
4. In Inngest dashboard: Apps → Sync App → enter `https://brand-alchemist-prakel.vercel.app/api/inngest`
5. Confirm all three functions are listed: `generate-creative`, `extract-website-brand`, `extract-pdf-brand`

*Code changes:*
- `app/actions/creatives.ts`: in `requestBatchCreativeGeneration`, include `ctaLabel`, `tone`, `intent`, `additionalContext` in the `inngest.send()` event payload data
- `generate-creative.ts`: destructure `ctaLabel`, `tone`, `intent`, `additionalContext` from `event.data`; pass to `buildPrompt()` in the `generate-image` step
- `CreativesGrid.tsx`: add empty state when `creatives.length === 0` — dark card with "No creatives yet" message and a "Generate New" link
- `CreativeCard.tsx`: when `creative.status === 'FAILED'`, render a dark card showing "Generation failed" with an error icon rather than a blank spot

*OpenAI key check:* Confirm `OPENAI_API_KEY` is set in Vercel. If the Pollinations fallback in `lib/openai.ts` is active, document which key controls which path so the team knows the quality tradeoff.

**Test scenarios:**
- Submit creative brief on live Vercel → event appears in Inngest dashboard → Events
- Inngest calls back to `/api/inngest` → visible in Inngest dashboard → Runs
- Creative status transitions: PENDING → PROCESSING → completed URL populated
- Completed creative appears in library (polling or Next.js revalidation)
- Creative library with zero creatives → shows "No creatives yet" state with CTA
- FAILED creative → shows error card, not blank space
- All three brief fields (ctaLabel, tone, intent) visible in the Inngest event payload in the dashboard

**Verification:** Submit brief on the live Vercel app → creative image appears in library within ~60 seconds. Inngest dashboard shows a successful run. Empty library renders the empty state card.

---

## Open Questions

- **`.env` in git**: The committed `.env` contains the live database password and API keys. This should be moved to `.gitignore` immediately and the secrets rotated. Verify this doesn't break the Vercel build (env vars set in dashboard take precedence).
- **Pollinations fallback**: Commit `2085ebb` added a Pollinations fallback. If `OPENAI_API_KEY` is absent, does generation silently fall back, or does it throw? Verify in `lib/openai.ts` before assuming the key is required.
- **Supabase email confirmation on Vercel**: Sign-up sends a confirmation email with a redirect to `${window.location.origin}/auth/callback`. On Vercel, this is the `.vercel.app` domain. If Supabase's allowed redirect URLs don't include this, email confirmation silently fails. Must be added in U1.

---

## Risks & Dependencies

| Risk | Likelihood | Mitigation |
|---|---|---|
| Prisma migration breaks existing Creative rows | Low | New columns are nullable — no backfill required |
| Inngest free tier limits concurrent generation | Low | 3 functions × low user volume = well within limits |
| Supabase email confirmation fails on Vercel domain | Medium | Explicitly covered in U1 redirect URL step |
| DATABASE_URL with `%40`-encoded password rejected by Vercel | Low | Test immediately via function log after first env var deploy |
| `.env` credential exposure (DB password in git) | High | Rotate credentials, remove `.env` from git in U1 |
