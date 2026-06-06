import type { Brand, CreativeFormat } from "@prisma/client";

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

export function buildPrompt(
  brand: Brand,
  format: CreativeFormat,
  brief?: string
): string {
  const parts: string[] = [
    "Professional marketing creative, social media post.",
    FORMAT_CONTEXT[format],
    `Brand: ${brand.name}.`,
  ];

  if (brand.primaryColor) {
    parts.push(`Primary color: ${brand.primaryColor}.`);
  }
  if (brand.secondaryColor) {
    parts.push(`Secondary color: ${brand.secondaryColor}.`);
  }
  if (brand.tone.length > 0) {
    parts.push(`Visual style: ${brand.tone.join(", ")}.`);
  }
  if (brand.voiceGuide) {
    parts.push(`Brand feel: ${brand.voiceGuide.slice(0, 200)}.`);
  }
  if (brief) {
    parts.push(`Content: ${brief}.`);
  }

  parts.push(
    "Do not render any text or typography in the image — text will be composited separately.",
    "Photorealistic, high quality, clean composition."
  );

  return parts.join(" ");
}

export { FORMAT_SIZE };
