import { prisma } from './prisma'
import { openaiImages } from './openai'
import { uploadAsset } from './storage'
import sharp from 'sharp'
import { nanoid } from 'nanoid'
import type { CreativeFormat } from '@prisma/client'

const GENERATE_SIZES: Record<CreativeFormat, { width: number; height: number }> = {
  INSTAGRAM_SQUARE: { width: 1088, height: 1088 },
  INSTAGRAM_STORY:  { width: 1088, height: 1920 },
  LINKEDIN_POST:    { width: 1200, height: 624  },
  LINKEDIN_BANNER:  { width: 1584, height: 528  },
}

const FINAL_SIZES: Record<CreativeFormat, { width: number; height: number }> = {
  INSTAGRAM_SQUARE: { width: 1080, height: 1080 },
  INSTAGRAM_STORY:  { width: 1080, height: 1920 },
  LINKEDIN_POST:    { width: 1200, height: 628  },
  LINKEDIN_BANNER:  { width: 1584, height: 528  },
}

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

    let pipeline = sharp(rawBuffer)
    const final = FINAL_SIZES[format]
    const gen = GENERATE_SIZES[format]

    if (format === 'LINKEDIN_POST') {
      pipeline = pipeline.extend({ top: 2, bottom: 2, left: 0, right: 0, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    } else if (gen.width !== final.width || gen.height !== final.height) {
      pipeline = pipeline.resize(final.width, final.height, { fit: 'cover', position: 'center' })
    }
    const processed = await pipeline.jpeg({ quality: 95 }).toBuffer()

    const key = `creatives/${creativeId}/${nanoid()}.jpg`
    const { url } = await uploadAsset(processed, key, 'image/jpeg')

    await prisma.creative.update({ where: { id: creativeId }, data: { status: 'COMPLETED', url, key } })
  } catch (err) {
    console.error('[local-generation]', creativeId, err)
    await prisma.creative.update({ where: { id: creativeId }, data: { status: 'FAILED' } }).catch(() => {})
  }
}
