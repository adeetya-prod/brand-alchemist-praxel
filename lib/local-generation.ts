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

export async function runLocalGeneration(creativeId: string, format: CreativeFormat, prompt: string) {
  try {
    await prisma.creative.update({ where: { id: creativeId }, data: { status: 'PROCESSING' } })

    if (!openaiImages) throw new Error('OPENAI_API_KEY not configured — image generation requires a direct OpenAI key')

    const { width, height } = GENERATE_SIZES[format]
    const response = await openaiImages.images.generate({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size: `${width}x${height}` as any,
      response_format: 'b64_json',
    })
    const b64 = response.data?.[0]?.b64_json
    if (!b64) throw new Error('No image data returned from OpenAI')

    let pipeline = sharp(Buffer.from(b64, 'base64'))
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
