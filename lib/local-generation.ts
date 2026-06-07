import { prisma } from './prisma'
import { openaiImages } from './openai'
import { uploadAsset } from './storage'
import { composeCreative, GENERATE_SIZES } from './image-processing'
import { nanoid } from 'nanoid'
import type { CreativeFormat } from '@prisma/client'

// Free fallback: Pollinations.ai — no API key required
async function generateViaPollinations(prompt: string, width: number, height: number): Promise<Buffer> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 99999)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })
  if (!res.ok) throw new Error(`Pollinations returned ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

export async function runLocalGeneration(creativeId: string, format: CreativeFormat, prompt: string) {
  try {
    await prisma.creative.update({ where: { id: creativeId }, data: { status: 'PROCESSING' } })

    // Fetch brand identity and CTA label for compositing
    const creative = await prisma.creative.findUniqueOrThrow({
      where: { id: creativeId },
      select: { ctaLabel: true, brandId: true },
    })
    const brand = await prisma.brand.findUniqueOrThrow({ where: { id: creative.brandId } })

    const { width, height } = GENERATE_SIZES[format]
    let rawBuffer: Buffer

    if (openaiImages) {
      // Primary: gpt-image-2 via direct OpenAI key
      const response = await openaiImages.images.generate({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size: `${width}x${height}` as any,
        response_format: 'b64_json',
      })
      const b64 = response.data?.[0]?.b64_json
      if (!b64) throw new Error('No image data returned from OpenAI')
      rawBuffer = Buffer.from(b64, 'base64')
    } else {
      // Fallback: Pollinations.ai (free, no API key needed)
      console.log(`[local-generation] No OPENAI_API_KEY — using Pollinations.ai for ${creativeId}`)
      rawBuffer = await generateViaPollinations(prompt, width, height)
    }

    const processed = await composeCreative(
      rawBuffer,
      format,
      { primaryColor: brand.primaryColor, logoUrl: brand.logoUrl, fontHeading: brand.fontHeading },
      creative.ctaLabel,
    )

    const key = `creatives/${creativeId}/${nanoid()}.jpg`
    const { url } = await uploadAsset(processed, key, 'image/jpeg')

    await prisma.creative.update({ where: { id: creativeId }, data: { status: 'COMPLETED', url, key } })
  } catch (err) {
    console.error('[local-generation]', creativeId, err)
    await prisma.creative.update({ where: { id: creativeId }, data: { status: 'FAILED' } }).catch(() => {})
  }
}
