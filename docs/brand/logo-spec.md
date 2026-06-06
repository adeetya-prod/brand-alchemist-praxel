# Brand Alchemist — Logo Design Specification

## Concept

An alchemist's flask (round-bottom flask / retort) — the universal symbol of transformation. The flask silhouette is minimal and geometric: it works at 16px favicon size and scales cleanly to large display contexts. Inside the flask, raw material (brand identity input) transforms into vivid creative output — represented by the purple-to-coral gradient fill.

The concept is self-referential: Brand Alchemist uses a flask to make things. The flask is the product, the metaphor, and the brand mark simultaneously.

---

## Geometry (SVG Construction)

**ViewBox:** `0 0 40 40` (1:1 aspect ratio, scalable)

**Components:**

```
Flask mouth (top bar):
  rect x="14" y="6" width="12" height="3" rx="1.5"

Flask neck (connecting tube):
  rect x="17" y="9" width="6" height="9"

Flask body (round bulb):
  circle cx="20" cy="27" r="11"
```

**Single clip-path trick:** Define a `<clipPath id="flask">` that contains the union of all three shapes. Apply `fill="url(#brand-gradient)"` to a rect covering the full viewBox, clipped to `clip-path="url(#flask)"`. This produces a single gradient sweep across the entire flask — no seams between the neck and body.

**Gradient definition:**

```xml
<defs>
  <linearGradient id="brand-gradient" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#7C3AED"/>
    <stop offset="100%" stop-color="#FF6B6B"/>
  </linearGradient>
  <clipPath id="flask">
    <rect x="14" y="6" width="12" height="3" rx="1.5"/>
    <rect x="17" y="9" width="6" height="9"/>
    <circle cx="20" cy="27" r="11"/>
  </clipPath>
</defs>
<rect width="40" height="40" fill="url(#brand-gradient)" clip-path="url(#flask)"/>
```

**Stroke option (favicon/small sizes):** At sizes below 24px, use stroke-only variant — `fill="none"`, `stroke="#7C3AED"`, `stroke-width="2"` on each shape. No gradient at this size; single flat purple.

---

## Color Story

| Usage | Value |
|---|---|
| Gradient start (purple) | `#7C3AED` |
| Gradient end (coral) | `#FF6B6B` |
| Gradient angle | `135°` (top-left to bottom-right) |
| Monochrome dark bg | `#FFFFFF` flat fill |
| Monochrome light bg | `#7C3AED` flat fill |

The gradient direction (top-left → bottom-right) mirrors the visual metaphor: raw material enters at top (purple = raw, unprocessed creative tension) and exits at bottom right (coral = warm, finished, ready-to-publish output).

---

## Monochrome Variants

**White logo (on dark backgrounds):**
- Flask fill: `#FFFFFF`
- Wordmark: `#FFFFFF`
- Use on: landing page hero, dark dashboard panels, email footers

**Purple logo (on white/light backgrounds):**
- Flask fill: `#7C3AED` (no gradient)
- Wordmark: `#7C3AED`
- Use on: light card backgrounds, printed materials, partner co-branding

**Black logo (print/legal):**
- Flask fill: `#000000`
- Wordmark: `#000000`
- Use only when color is unavailable (legal docs, fax, etc.)

---

## Wordmark

**Typeface:** Geist Sans (already loaded in the product as `--font-geist-sans`)

**Weight contrast:**
- "Brand" → Geist Sans **Medium** (500)
- "Alchemist" → Geist Sans **Light** (300)

The weight differential reinforces the noun hierarchy: "Brand" is the subject, "Alchemist" is the action/descriptor. Users read it as "Brand [that is an] Alchemist."

**Spacing:** `8px` gap between flask mark and wordmark. Wordmark baseline aligns with the horizontal center of the flask body (not the total height).

**Full lockup dimensions at standard size (32px mark height):**
- Flask mark: 32×32px
- Gap: 8px
- Wordmark: ~130px wide (varies by rendering)
- Total width: ~170px

---

## Favicon Treatment

**16×16 and 32×32 (ICO/PNG):**
- Flask mark only, no wordmark
- Use stroke-only variant at 16px: `stroke="#7C3AED"`, `stroke-width="2"`, no fill
- At 32px: full gradient fill version

**Apple Touch Icon (180×180):**
- Flask mark centered on `#0D0117` (dark purple-black) background
- Gradient fill, scaled to ~120px within the 180px square

**`app/layout.tsx` metadata:**
```ts
icons: {
  icon: '/favicon.svg',
  apple: '/apple-touch-icon.png',
}
```

---

## Clear Space

Minimum clear space on all four sides = **1× the flask mark width** at the current render size.

At 32px mark: 32px clear space on each side.  
At 16px mark: 16px clear space on each side.

Never overlap the logo with other brand marks, photos, or busy textures within this clear space.

---

## Minimum Sizes

| Context | Minimum | Notes |
|---|---|---|
| Mark only (flask) | 16px height | Use stroke-only variant |
| Full lockup | 24px height | May truncate wordmark to "BA" monogram below this |
| Favicon | 16×16 | Stroke-only; test in browser tab |

---

## Implementation Notes for the SVG Engineer

1. Start from the geometry above. Verify the flask body circle (`cx=20 cy=27 r=11`) does not clip at the bottom of the `0 0 40 40` viewBox — it extends to y=38, leaving 2px of breathing room.

2. The `clipPath` approach produces cleaner output than a `<path>` union. For production, optionally flatten to a single compound `<path>` using a vector editor (Figma, Inkscape) for the final SVG export — remove any unnecessary `<defs>` and metadata to keep file size under 1KB.

3. Export variants:
   - `public/logo.svg` — full gradient lockup
   - `public/logo-white.svg` — white monochrome lockup  
   - `public/favicon.svg` — mark only, gradient
   - `public/apple-touch-icon.png` — 180×180 rasterized on dark bg

4. Test the favicon in a real browser tab at multiple zoom levels before finalizing.
