export type ReviewableExtraction = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  tone: string[]
  tagline: string
}

export function normalizeExtractedData(
  raw: unknown,
  source: 'PDF' | 'WEBSITE'
): ReviewableExtraction {
  const data = (raw ?? {}) as Record<string, unknown>

  let primaryColor = ''
  let secondaryColor = ''
  let accentColor = ''
  let fontHeading = ''
  let fontBody = ''
  let tone: string[] = []
  let tagline = ''

  // Colors: both PDF and WEBSITE store an array of color objects with .hex
  const colors = Array.isArray(data.colors) ? data.colors : []
  primaryColor = (colors[0] as { hex?: string })?.hex ?? ''
  secondaryColor = (colors[1] as { hex?: string })?.hex ?? ''
  accentColor = (colors[2] as { hex?: string })?.hex ?? ''

  // Fonts: both store array of objects with .name
  const fonts = Array.isArray(data.fonts) ? data.fonts : []
  fontHeading = (fonts[0] as { name?: string })?.name ?? ''
  fontBody = (fonts[1] as { name?: string })?.name ?? ''

  if (source === 'PDF') {
    // PDF: voiceKeywords[], taglines[]
    const keywords = Array.isArray(data.voiceKeywords) ? data.voiceKeywords as string[] : []
    tone = keywords.slice(0, 8)
    const taglines = Array.isArray(data.taglines) ? data.taglines as string[] : []
    tagline = taglines[0] ?? ''
  } else {
    // WEBSITE: toneKeywords[], tagline string
    const keywords = Array.isArray(data.toneKeywords) ? data.toneKeywords as string[] : []
    tone = keywords.slice(0, 8)
    tagline = typeof data.tagline === 'string' ? data.tagline : ''
  }

  return { primaryColor, secondaryColor, accentColor, fontHeading, fontBody, tone, tagline }
}
