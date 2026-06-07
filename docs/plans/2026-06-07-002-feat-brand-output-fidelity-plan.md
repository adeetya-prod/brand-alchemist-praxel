---
plan_type: feat
status: active
created: 2026-06-07
strategy_tracks:
  - Brand quality & output fidelity
---

# feat: Brand Output Fidelity — Prompt Enrichment, Logo & Colour Compositing, CTA Text Rendering

## Summary

The creative generation pipeline produces images that often don't look on-brand: colours are referenced by hex only (gpt-image-2 treats this as a soft hint, not a constraint), the brand logo is never composited, and the CTA label is never rendered despite the prompt reserving space for it. This plan closes those gaps across three layers: (1) richer prompt signals, (2) Sharp-based logo and colour accent compositing, and (3) SVG-based CTA text rendering. The result is a generated creative that enforces brand identity rather than just requesting it.

---

## Problem Frame

**Why now:** Brand Alchemist's strategy is "brand rules first, generation second." That promise is currently broken — the pipeline reads brand rules but does not enforce them in the output. Until this is fixed, Week-2 retention will suffer because users see output that doesn't look like their brand.

**Root gaps identified in research:**
- `buildBrandSystemContext()` passes colours as bare hex strings only; gpt-image-2 ignores hex constraints under many conditions.
- `brand.fontHeading`, `brand.fontBody`, and `brand.tagline` are stored but never reach `buildPrompt()`.
- `brand.voiceGuide` is truncated at 150 chars, often cutting mid-sentence.
- `Brand.logoUrl` is stored but never fetched or composited anywhere in the pipeline.
- `postProcess()` does only pixel trimming — no overlay, no text, no colour enforcement.
- The Inngest and `lib/local-generation.ts` paths share logic in two diverging copies.

**Scope:** Generation pipeline only. No UI changes, no schema changes.

---

## Requirements

- **R1** — Generated images must reflect brand primary/secondary/accent colours visibly and consistently.
- **R2** — The brand logo must appear in a consistent position on every generated creative where a `logoUrl` exists.
- **R3** — The CTA label must be rendered as a styled button on the image where a `ctaLabel` exists.
- **R4** — Both the Inngest pipeline and the local-dev pipeline must produce identical output.
- **R5** — Existing dimension and format behaviour must not regress.

---

## Key Technical Decisions

**KTD-1: Colour naming strategy.** The prompt will include both hex and a descriptive English name (e.g., `deep violet (#7C3AED)`). Implementation: a minimal `lib/colour-names.ts` with ~50 common colour anchors and nearest-neighbour RGB distance matching — no third-party npm package. This keeps the bundle lean and covers the practical range of brand colours.

**KTD-2: Brand data in Inngest job.** `brandId` is already in the Inngest event payload but is never used. For compositing, add a `fetch-brand` step at the start of the job that calls `prisma.brand.findUniqueOrThrow({ where: { id: brandId } })`. This keeps brand data fresh and avoids denormalising it into the event payload. Same pattern applies in `local-generation.ts`.

**KTD-3: Logo compositing position and legibility.** Logo placed bottom-right (`southeast`) with 24px inset from edges, max-width = 15% of image width (aspect ratio preserved). Logos without transparency would look jarring on dark backgrounds; add a semi-transparent white rounded-rectangle backing (60% opacity, 8px padding around logo bounds). Logo step is silently skipped — no error thrown — when `logoUrl` is null or the fetch fails.

**KTD-4: Colour accent approach.** Post-generation colour correction (palette analysis + re-prompt) is the more accurate solution but requires an additional API round-trip. For this plan: add a thin solid-colour strip at the bottom of every creative using `brand.primaryColor`. This is deterministic, cheap, and visually reinforces brand colour without altering the generated scene. Strip height: 6px (all formats except LINKEDIN_BANNER); 4px (LINKEDIN_BANNER). Post-generation colour analysis is deferred as the Phase-2 escalation.

**KTD-5: CTA text rendering.** Use Sharp's built-in SVG rasterization (via librsvg, included in Sharp's prebuilt binary) rather than `@napi-rs/canvas`. Reason: SVG+Sharp avoids a new native binary dependency and librsvg is bundled in Sharp's official prebuilt for linux-x64 (Vercel's runtime). Approach: construct an SVG string with a rounded-rect button and text element, pass to `sharp(Buffer.from(svgStr)).png().toBuffer()`, composite onto base image. Fonts: SVG will use system sans-serif for v1; Google Fonts embedding via base64 `@font-face` in the SVG is the follow-up upgrade path when `brand.fontHeading` is set.

**KTD-6: Pipeline consolidation.** Extract all compositing logic into `lib/image-processing.ts`, exporting `composeCreative(rawBuf, format, brand, ctaLabel?)`. Both callers (`generate-creative.ts` and `local-generation.ts`) import from this module. The function signature makes brand data an explicit input, not an ambient dependency.

---

## High-Level Technical Design

### Post-change generation pipeline

```
buildPrompt(brand, format, brief, options)
  └─ buildBrandSystemContext()
       now includes: descriptive colour names + hex, tagline,
                     font mood hint, voiceGuide (full, not truncated)

gpt-image-2 / Pollinations fallback
  └─ raw image buffer at GENERATE_SIZE

composeCreative(rawBuf, format, brand, ctaLabel) [lib/image-processing.ts]
  Step 1: dimension correction   existing resize/pad → FINAL_SIZE
  Step 2: colour accent strip    sharp.create() coloured rect → composite at bottom
  Step 3: logo overlay           fetch logoUrl → normalize PNG → composite SE corner
  Step 4: CTA button             SVG string → sharp rasterize → composite above strip

  └─ JPEG buffer at 95 quality, FINAL_SIZE

R2 upload / local filesystem
```

Steps 2–4 are individually skippable: if the required input is null (no `primaryColor`, no `logoUrl`, no `ctaLabel`), the step is a no-op and `composeCreative()` still returns a valid buffer.

### Compositing layer order (bottom to top)

```
[Generated image — full bleed]
[Colour accent strip — 6px, bottom edge]       ← Step 2
[Logo backing rect — semi-transparent white]   ← Step 3
[Logo — bottom-right corner]                   ← Step 3
[CTA button SVG — bottom-centre, above strip]  ← Step 4
```

---

## Implementation Units

### U1. Enrich prompt signals in `lib/prompts.ts`

**Goal:** Richer brand identity signals in the prompt — descriptive colour names, voiceGuide fix, tagline, font mood context.

**Requirements:** R1

**Dependencies:** None

**Files:**
- `lib/colour-names.ts` (create)
- `lib/prompts.ts`

**Approach:**
- Create `lib/colour-names.ts`: export `nearestColourName(hex: string): string`. Implement a table of ~50 colour anchors (red, crimson, coral, orange, amber, yellow, lime, green, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, white, silver, grey, charcoal, black, brown, tan, gold) with their RGB values. Find nearest by Euclidean distance in RGB space. Return the label string.
- In `buildBrandSystemContext()`: replace bare hex strings with `"${nearestColourName(hex)} (${hex})"` for primary, secondary, and accent. Add role hints: primary = dominant element, secondary = supporting surfaces, accent = highlights and interactive elements.
- Fix voiceGuide truncation: remove `.slice(0, 150)`. If length is a concern, cut at 400 chars at the nearest sentence boundary (`lastIndexOf('.', 400) + 1`).
- Add `brand.tagline` to system context if set: `"Brand tagline: ${brand.tagline}."`.
- Add font mood signal: `"Brand typography: ${brand.fontHeading ?? 'clean sans-serif'} (heading). Reflect the typographic mood in composition — do not render text."`.

**Patterns to follow:** `buildBrandSystemContext()` in `lib/prompts.ts` lines 21–29.

**Test scenarios:**
- `nearestColourName('#7C3AED')` returns a purple/violet string, not empty string or throws.
- `nearestColourName('#FF0000')` returns 'red'.
- `nearestColourName('#FFFFFF')` returns 'white'.
- `buildBrandSystemContext()` with all brand fields set: output contains descriptive colour name + hex for all three colours, tagline, and font context; no `"undefined"` substrings.
- `buildBrandSystemContext()` with all optional fields null/empty: no `"undefined"` values; font context uses fallback `"clean sans-serif"`.
- Brand with `voiceGuide` of 300+ characters: the guide is not cut mid-sentence; the full text or a sentence-boundary cut appears in the prompt.

**Verification:** Log the constructed prompt for a real brand; confirm descriptive colour names are present alongside hex codes and no template literal artefacts appear.

---

### U2. Consolidate generation pipeline and thread brand data

**Goal:** Single `composeCreative()` function imported by both pipelines; Inngest job fetches brand data using the already-available `brandId`.

**Requirements:** R4, R5

**Dependencies:** None (can proceed in parallel with U1)

**Files:**
- `lib/image-processing.ts` (create)
- `app/inngest/generate-creative.ts`
- `lib/local-generation.ts`

**Approach:**
- Create `lib/image-processing.ts`. Export:
  - `type BrandCompositeData = { primaryColor: string | null; logoUrl: string | null; fontHeading: string | null }`.
  - `composeCreative(rawBuf: Buffer, format: CreativeFormat, brand: BrandCompositeData, ctaLabel?: string | null): Promise<Buffer>` — Steps 1–4 stubbed in this unit (Step 1 is the existing resize/pad logic; Steps 2–4 are pass-through stubs returning the buffer unchanged, filled in by U3–U5).
- Move `postProcess()` body from `generate-creative.ts` into Step 1 of `composeCreative()`. Delete `postProcess()` from `generate-creative.ts`.
- In `generate-creative.ts`:
  - Add `step.run('fetch-brand', ...)` as the first step, calling `prisma.brand.findUniqueOrThrow({ where: { id: event.data.brandId } })`. Destructure `primaryColor`, `logoUrl`, `fontHeading` for compositing.
  - Replace `postProcess(buf, format)` call with `composeCreative(buf, format, brand, event.data.ctaLabel)`.
  - Verify `brandId` and `ctaLabel` are present in the `inngest.send()` payload in `app/actions/creatives.ts`; add them if missing.
  - Follow `Array.from(buf)` / `Buffer.from(array)` pattern at the `generate-image` → `post-process` step boundary (and any new boundaries added by U3–U5).
- In `local-generation.ts`: replace inline Sharp calls with `composeCreative()`, passing brand data fetched at the start of the local run.

**Patterns to follow:** Buffer serialization pattern in `generate-creative.ts` lines 82–88.

**Test scenarios:**
- `composeCreative()` with a real JPEG buffer + INSTAGRAM_SQUARE + all brand fields null: returns a buffer, dimensions 1080×1080, no error.
- `composeCreative()` with LINKEDIN_POST: output is 1200×628 (Step 1 padding preserved).
- Inngest `fetch-brand` step fires and returns a brand object (verify in Inngest dev console).
- `ctaLabel` from the Creative record reaches `composeCreative()` in both paths.
- Local-generation path produces the same output dimensions as Inngest path for the same format.

**Verification:** Generate a creative via both local and Inngest paths; output dimensions match; no "postProcess is not defined" or unhandled rejection.

---

### U3. Logo overlay compositing

**Goal:** Composite the brand logo onto each creative at the bottom-right corner.

**Requirements:** R2

**Dependencies:** U2

**Files:**
- `lib/image-processing.ts`

**Approach:**
- Implement Step 3 of `composeCreative()`. Skip if `brand.logoUrl` is null.
- Fetch logo: `fetch(brand.logoUrl)` with a 10-second timeout → `Buffer`. Wrap in `try/catch`; on any error, log a warning and return the buffer unchanged (do not throw).
- Normalize via Sharp: `.png()` (preserves or creates transparency), `.resize({ width: Math.floor(imageWidth * 0.15), fit: 'inside', withoutEnlargement: true })`.
- Compute logo dimensions from Sharp metadata after resize.
- Create semi-transparent backing: `sharp({ create: { width: logoW + 16, height: logoH + 16, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 153 } } }).png().toBuffer()`.
- Composite backing, then logo, at bottom-right: `top: imageHeight - logoH - 16 - stripHeight - 24`, `left: imageWidth - logoW - 16 - 24`.
- `stripHeight` is imported from the Step 2 constant (6 or 4 depending on format).

**Patterns to follow:** Sharp `composite()` — `{ input: Buffer, top: N, left: N }`.

**Test scenarios:**
- Brand with `logoUrl` pointing to a valid PNG URL: generated image has a logo-shaped element at the bottom-right (visual inspection).
- Brand with `logoUrl` pointing to a JPEG: no Sharp error; logo appears.
- Brand with `logoUrl` null: buffer returned unchanged, no error thrown.
- `logoUrl` returns a 404 or times out: warning logged, pipeline continues, output dimensions correct.
- Logo does not overlap the colour accent strip from U4.
- Logo does not overflow image bounds on the narrowest format (INSTAGRAM_SQUARE).

**Verification:** Generate a creative for a brand with a `logoUrl`; confirm logo appears at bottom-right. Trigger a logo-fetch failure (invalid URL); confirm job still completes.

---

### U4. Brand colour accent strip

**Goal:** Composite a thin brand-coloured strip at the bottom of every creative to reinforce brand colour identity.

**Requirements:** R1

**Dependencies:** U2

**Files:**
- `lib/image-processing.ts`

**Approach:**
- Implement Step 2 of `composeCreative()`. Skip if `brand.primaryColor` is null or not a valid hex string.
- Parse `brand.primaryColor` (format `#RRGGBB` or `#RGB`) into `{ r, g, b }`.
- Strip height constant: 6px for INSTAGRAM_SQUARE, INSTAGRAM_STORY, LINKEDIN_POST; 4px for LINKEDIN_BANNER. Export this constant so Step 3 (U3) can use it for logo positioning.
- Create strip buffer: `sharp({ create: { width: imageWidth, height: stripHeight, channels: 3, background: { r, g, b } } }).jpeg().toBuffer()`.
- Composite at `top: imageHeight - stripHeight, left: 0`.

**Patterns to follow:** Sharp `.create()` and `.composite()`.

**Test scenarios:**
- Brand with `primaryColor: '#7C3AED'`: the bottom N pixels of the output are purple (read with `sharp().extract({ top: imageHeight - stripHeight, left: 0, width: 10, height: stripHeight }).raw().toBuffer()` and check RGB values match).
- Brand with `primaryColor` null: strip step skipped, no error.
- Brand with `primaryColor: '#RGB'` shorthand: parsed correctly.
- Strip height is 6px for square/story/post formats; 4px for banner.
- Strip spans the full image width.

**Verification:** Generate a creative; inspect the bottom strip pixels; RGB values within tolerance of `brand.primaryColor`.

---

### U5. CTA button compositing via SVG + Sharp

**Goal:** Render the CTA label as a styled button on the image, positioned above the colour accent strip.

**Requirements:** R3

**Dependencies:** U2, U3, U4

**Files:**
- `lib/image-processing.ts`

**Approach:**
- Implement Step 4 of `composeCreative()`. Skip if `ctaLabel` is null or empty.
- Parse `brand.primaryColor` for button background; default to `#000000` if null.
- Determine button dimensions: fixed height 48px, width = estimated text width + 48px horizontal padding (use a fixed char-width estimate of 10px per character for v1; refine in follow-up if needed).
- Cap button width at `imageWidth - 48`.
- Truncate `ctaLabel` with ellipsis if it would exceed `imageWidth - 96px` width.
- Build SVG string:
  ```
  <svg width="${buttonW}" height="48" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${buttonW}" height="48" rx="12" fill="${bg}" />
    <text x="${buttonW/2}" y="30" font-family="Arial, Helvetica, sans-serif"
          font-size="16" font-weight="bold" fill="white"
          text-anchor="middle">${escapedLabel}</text>
  </svg>
  ```
- Rasterize: `sharp(Buffer.from(svgStr)).png().toBuffer()`.
- Position: centred horizontally at `top: imageHeight - stripHeight - 24 - 48`, `left: Math.floor((imageWidth - buttonW) / 2)`.
- `escapedLabel`: XML-escape `&`, `<`, `>` in the label string to prevent SVG injection.

**Patterns to follow:** Sharp SVG input handling (same as `sharp(Buffer.from('<svg>...</svg>')).png()`).

**Test scenarios:**
- `ctaLabel: 'Learn More'`, brand with `primaryColor` set: output image has a coloured button with 'Learn More' text visible in the lower-centre area (visual inspection).
- `ctaLabel` is null: pipeline completes without error; no CTA layer.
- `ctaLabel` contains `&` or `<`: XML-escaped correctly; no Sharp SVG parse error.
- Very long CTA label: button width is capped at `imageWidth - 48`; text is truncated with ellipsis.
- CTA button top edge does not overlap the colour accent strip bottom edge.
- Button renders at correct position for all four format sizes (different widths).

**Verification:** Generate a creative with `ctaLabel` set; confirm button appears in the lower-centre of the image with correct colour. Check that the button does not bleed into the colour accent strip.

---

## Scope Boundaries

### In scope
- Prompt enrichment: descriptive colour names, voiceGuide fix, tagline, font mood signal
- Pipeline consolidation into `lib/image-processing.ts`
- Logo overlay compositing (Sharp)
- Brand colour accent strip (Sharp)
- CTA button compositing (SVG + Sharp rasterization)

### Deferred to Follow-Up Work
- Post-generation colour analysis / regeneration loop — the pre-designed Phase-2 escalation if prompt-level colour fidelity is still insufficient (see KTD-4)
- Google Fonts embedding in SVG for custom brand fonts (upgrade path for U5)
- Headline / body copy text compositing — requires layout zone management, larger effort
- Brand font local caching / asset pipeline
- Logo aspect-ratio layout variants (circular crop, branded watermark styles)

### Out of scope
- UI changes or new pages
- Schema changes
- New creative formats
- Billing, paywall, or any other strategy track

---

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Sharp SVG rasterization fails on Vercel (librsvg not bundled) | Low | High | Sharp's official linux-x64 prebuilt includes librsvg; validate with `npm run build` + deploy preview before merging |
| Logo fetch from external URL times out | Medium | Low | 10-second fetch timeout; `try/catch` with silent skip — job never fails because of logo fetch |
| Logo without transparency looks bad over dark backgrounds | Medium | Medium | Semi-transparent white backing (KTD-3); improves legibility on both light and dark scenes |
| Buffer crossing Inngest step boundary without serialization | Medium | High | Follow `Array.from(buf)` / `Buffer.from(array)` at every step boundary (documented in CLAUDE.md) |
| CTA button overlaps logo on narrow formats | Low | Medium | Logo is SE corner; CTA is bottom-centre above strip — horizontal separation, not overlap |
| `local-generation.ts` diverges from Inngest path again in future | Medium | Medium | U2 consolidation into `lib/image-processing.ts` makes both callers import from one place |

---

## Open Questions

**Deferred to implementation:**

- What happens when `brand.logoUrl` is an SVG? Sharp can rasterize SVG but needs explicit width/height if the SVG has no `viewBox`. Log a warning and skip logo compositing if Sharp throws on SVG input.
- `brandId` is in the Inngest event payload per research but verify it is passed in `inngest.send()` in `app/actions/creatives.ts` — if missing, add it in U2.
- `ctaLabel` must flow from the `Creative` record (not `Brand`) through the Inngest event. Verify `app/actions/creatives.ts` includes it in the event payload; add if absent.

---

## Sources & Research

- Research: `lib/prompts.ts`, `app/inngest/generate-creative.ts`, `lib/local-generation.ts`, `prisma/schema.prisma`, `app/actions/creatives.ts`, `lib/db/brands.ts`
- Prior plan: `docs/plans/2026-06-06-002-feat-brand-alchemist-v2-product-overhaul-plan.md` — colour fidelity risk (R15), compositing architecture (KTD-4), font exclusion decision (KTD-4)
- Prior plan: `docs/plans/2026-06-06-001-feat-brand-alchemist-saas-platform-plan.md` — original compositing scope (R8)
- CLAUDE.md: Inngest Buffer serialization pattern, gpt-image-2 size constraints
