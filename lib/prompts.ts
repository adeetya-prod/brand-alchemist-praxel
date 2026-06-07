import type { Brand, CreativeFormat } from "@prisma/client";
import { nearestColourName } from "./colour-names";

const FORMAT_CONTEXT: Record<CreativeFormat, string> = {
  INSTAGRAM_SQUARE:
    "Square composition (1:1), subject centered, ample negative space at top and bottom for text overlay.",
  INSTAGRAM_STORY:
    "Vertical composition (9:16), subject in lower two-thirds, clear top third reserved for headline text overlay.",
  LINKEDIN_POST:
    "Horizontal composition (1.91:1), professional scene, left-aligned subject with clear right-side area for text overlay.",
  LINKEDIN_BANNER:
    "Ultra-wide panoramic strip composition, abstract or environmental background, center subject, no critical detail at extreme edges.",
};

const FORMAT_SIZE: Record<CreativeFormat, string> = {
  INSTAGRAM_SQUARE: "1088x1088",
  INSTAGRAM_STORY: "1088x1920",
  LINKEDIN_POST: "1200x624",
  LINKEDIN_BANNER: "1584x528",
};

export function buildBrandSystemContext(brand: Brand): string {
  const parts: string[] = []

  if (brand.primaryColor) {
    const name = nearestColourName(brand.primaryColor)
    parts.push(`Brand primary color (dominant element): ${name} (${brand.primaryColor}).`)
  }
  if (brand.secondaryColor) {
    const name = nearestColourName(brand.secondaryColor)
    parts.push(`Secondary color (supporting surfaces): ${name} (${brand.secondaryColor}).`)
  }
  if (brand.accentColor) {
    const name = nearestColourName(brand.accentColor)
    parts.push(`Accent color (highlights and interactive elements): ${name} (${brand.accentColor}).`)
  }
  if (parts.length > 0) {
    parts.push('Use ONLY these colors. Do not introduce colors not listed above.')
  }

  if (brand.tone.length > 0) parts.push(`Brand tone: ${brand.tone.join(', ')}.`)

  if (brand.voiceGuide) {
    let guide = brand.voiceGuide
    if (guide.length > 400) {
      const cut = guide.lastIndexOf('.', 400)
      guide = cut > 0 ? guide.slice(0, cut + 1) : guide.slice(0, 400)
    }
    parts.push(`Brand mood: ${guide}`)
  }

  if (brand.tagline) parts.push(`Brand tagline: ${brand.tagline}.`)

  const font = brand.fontHeading ?? 'clean sans-serif'
  parts.push(
    `Brand typography: ${font} (heading). Reflect the typographic mood in composition — do not render text.`
  )

  return parts.join(' ')
}

export function buildPrompt(
  brand: Brand,
  format: CreativeFormat,
  brief?: string,
  variantIndex = 0,
  options?: { ctaLabel?: string; tone?: string; intent?: string; additionalContext?: string }
): string {
  const parts: string[] = [
    "Professional marketing creative, social media post.",
    FORMAT_CONTEXT[format],
    `Brand: ${brand.name}.`,
    buildBrandSystemContext(brand),
  ];

  if (options?.intent) {
    parts.push(`Campaign goal: ${options.intent}.`);
  }
  if (options?.tone) {
    parts.push(`Creative tone: ${options.tone} — convey through composition, lighting, and color temperature.`);
  }
  if (options?.ctaLabel) {
    parts.push(`Reserve a clear area for a '${options.ctaLabel}' CTA button overlay.`);
  }

  if (brief) {
    parts.push(`Content: ${brief}.`);
  }
  if (options?.additionalContext) {
    parts.push(`Additional context: ${options.additionalContext}.`);
  }

  if (variantIndex === 1) {
    parts.push("Alternative composition, different layout angle and framing than the first variant.");
  }

  parts.push(
    "Do not render any text or typography in the image — text will be composited separately.",
    "Photorealistic, high quality, clean composition."
  );

  return parts.filter(Boolean).join(" ");
}

export { FORMAT_SIZE };
