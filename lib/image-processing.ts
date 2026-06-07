import sharp from 'sharp'
import type { CreativeFormat } from '@prisma/client'

export interface BrandCompositeData {
  primaryColor: string | null
  logoUrl: string | null
  fontHeading: string | null
}

export const GENERATE_SIZES: Record<CreativeFormat, { width: number; height: number }> = {
  INSTAGRAM_SQUARE: { width: 1088, height: 1088 },
  INSTAGRAM_STORY:  { width: 1088, height: 1920 },
  LINKEDIN_POST:    { width: 1200, height: 624  },
  LINKEDIN_BANNER:  { width: 1584, height: 528  },
}

export const FINAL_SIZES: Record<CreativeFormat, { width: number; height: number }> = {
  INSTAGRAM_SQUARE: { width: 1080, height: 1080 },
  INSTAGRAM_STORY:  { width: 1080, height: 1920 },
  LINKEDIN_POST:    { width: 1200, height: 628  },
  LINKEDIN_BANNER:  { width: 1584, height: 528  },
}

// Strip height in pixels per format
const STRIP_HEIGHT: Record<CreativeFormat, number> = {
  INSTAGRAM_SQUARE: 6,
  INSTAGRAM_STORY:  6,
  LINKEDIN_POST:    6,
  LINKEDIN_BANNER:  4,
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '')
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned
  if (full.length !== 6) return null
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

// Step 1: Resize/pad to final dimensions
async function correctDimensions(buf: Buffer, format: CreativeFormat): Promise<Buffer> {
  const { width, height } = FINAL_SIZES[format]
  const gen = GENERATE_SIZES[format]

  let pipeline = sharp(buf)

  if (format === 'LINKEDIN_POST') {
    pipeline = pipeline.extend({
      top: 2, bottom: 2, left: 0, right: 0,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
  } else if (gen.width !== width || gen.height !== height) {
    pipeline = pipeline.resize(width, height, { fit: 'cover', position: 'center' })
  }

  return pipeline.toBuffer()
}

// Step 2: Thin brand-coloured accent strip at bottom
async function applyColourStrip(buf: Buffer, format: CreativeFormat, primaryColor: string | null): Promise<Buffer> {
  if (!primaryColor) return buf
  const rgb = parseHex(primaryColor)
  if (!rgb) return buf

  const { width, height } = FINAL_SIZES[format]
  const stripH = STRIP_HEIGHT[format]

  const stripBuf = await sharp({
    create: { width, height: stripH, channels: 3, background: rgb },
  })
    .png()
    .toBuffer()

  return sharp(buf)
    .composite([{ input: stripBuf, top: height - stripH, left: 0 }])
    .toBuffer()
}

// Step 3: Brand logo overlay at bottom-right corner
async function applyLogoOverlay(buf: Buffer, format: CreativeFormat, logoUrl: string | null): Promise<Buffer> {
  if (!logoUrl) return buf

  let logoBuf: Buffer
  try {
    const res = await fetch(logoUrl, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`Logo fetch returned ${res.status}`)
    logoBuf = Buffer.from(await res.arrayBuffer())
  } catch (err) {
    console.warn('[image-processing] Logo fetch failed, skipping overlay:', err)
    return buf
  }

  const { width: imageW, height: imageH } = FINAL_SIZES[format]
  const maxLogoW = Math.floor(imageW * 0.15)
  const stripH = STRIP_HEIGHT[format]
  const margin = 24

  const logoNormalized = await sharp(logoBuf)
    .png()
    .resize({ width: maxLogoW, height: maxLogoW, fit: 'inside', withoutEnlargement: true })
    .toBuffer()

  const logoMeta = await sharp(logoNormalized).metadata()
  const logoW = logoMeta.width ?? maxLogoW
  const logoH = logoMeta.height ?? maxLogoW

  const backingPad = 8
  const backingW = logoW + backingPad * 2
  const backingH = logoH + backingPad * 2

  // Semi-transparent white backing for legibility on dark backgrounds
  const backingBuf = await sharp({
    create: {
      width: backingW,
      height: backingH,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 153 },
    },
  })
    .png()
    .toBuffer()

  const backingTop = imageH - stripH - margin - backingH
  const backingLeft = imageW - backingW - margin

  return sharp(buf)
    .composite([
      { input: backingBuf, top: backingTop, left: backingLeft },
      { input: logoNormalized, top: backingTop + backingPad, left: backingLeft + backingPad },
    ])
    .toBuffer()
}

// Step 4: CTA button via SVG rasterization (Sharp handles SVG natively via librsvg)
async function applyCTAButton(
  buf: Buffer,
  format: CreativeFormat,
  ctaLabel: string | null | undefined,
  primaryColor: string | null,
): Promise<Buffer> {
  const label = ctaLabel?.trim()
  if (!label) return buf

  const { width: imageW, height: imageH } = FINAL_SIZES[format]
  const stripH = STRIP_HEIGHT[format]
  const btnHeight = 48
  const margin = 24
  const hPad = 48
  const btnRadius = 12
  const fontSize = 16

  const bgColor = primaryColor ?? '#000000'

  // XML-escape label to prevent SVG injection
  const escapedLabel = label
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // Estimate button width: ~10px per character + horizontal padding, capped at imageW - 48
  const btnWidth = Math.min(label.length * 10 + hPad, imageW - 48)
  const textY = Math.floor(btnHeight / 2) + Math.floor(fontSize / 2) - 1

  const svg = `<svg width="${btnWidth}" height="${btnHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${btnWidth}" height="${btnHeight}" rx="${btnRadius}" fill="${bgColor}" />
  <text x="${Math.floor(btnWidth / 2)}" y="${textY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}" font-weight="bold" fill="white"
        text-anchor="middle">${escapedLabel}</text>
</svg>`

  const btnBuf = await sharp(Buffer.from(svg)).png().toBuffer()

  const btnTop = imageH - stripH - margin - btnHeight
  const btnLeft = Math.floor((imageW - btnWidth) / 2)

  return sharp(buf)
    .composite([{ input: btnBuf, top: btnTop, left: btnLeft }])
    .toBuffer()
}

export async function composeCreative(
  rawBuf: Buffer,
  format: CreativeFormat,
  brand: BrandCompositeData,
  ctaLabel?: string | null,
): Promise<Buffer> {
  let buf = await correctDimensions(rawBuf, format)         // Step 1
  buf = await applyColourStrip(buf, format, brand.primaryColor)  // Step 2
  buf = await applyLogoOverlay(buf, format, brand.logoUrl)        // Step 3
  buf = await applyCTAButton(buf, format, ctaLabel, brand.primaryColor) // Step 4
  return sharp(buf).jpeg({ quality: 95 }).toBuffer()
}
