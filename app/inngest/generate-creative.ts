import { inngest } from '@/lib/inngest'
import { openaiImages } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { uploadAsset } from '@/lib/storage'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
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

async function generateImage(prompt: string, format: CreativeFormat): Promise<Buffer> {
  const { width, height } = GENERATE_SIZES[format]

  if (openaiImages) {
    const response = await openaiImages.images.generate({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size: `${width}x${height}` as any,
      response_format: 'b64_json',
    })
    const b64 = response.data?.[0]?.b64_json
    if (!b64) throw new Error('No image data in response')
    return Buffer.from(b64, 'base64')
  }

  // Fallback: Pollinations.ai (free, no API key required)
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 99999)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })
  if (!res.ok) throw new Error(`Pollinations returned ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function postProcess(buffer: Buffer, format: CreativeFormat): Promise<Buffer> {
  const { width, height } = FINAL_SIZES[format]
  const gen = GENERATE_SIZES[format]

  let pipeline = sharp(buffer)

  if (format === 'LINKEDIN_POST') {
    pipeline = pipeline.extend({
      top: 2, bottom: 2, left: 0, right: 0,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
  } else if (gen.width !== width || gen.height !== height) {
    pipeline = pipeline.resize(width, height, { fit: 'cover', position: 'center' })
  }

  return pipeline.jpeg({ quality: 95 }).toBuffer()
}

export const generateCreative = inngest.createFunction(
  {
    id: 'generate-creative',
    retries: 1,
    triggers: [{ event: 'creative/generate.requested' }],
    onFailure: async ({ event }: { event: any }) => {
      const creativeId = event.data.event?.data?.creativeId
      if (creativeId) {
        await prisma.creative.update({ where: { id: creativeId }, data: { status: 'FAILED' } })
      }
    },
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { creativeId, format, prompt } = event.data

    await step.run('mark-processing', async () => {
      await prisma.creative.update({ where: { id: creativeId }, data: { status: 'PROCESSING' } })
    })

    const imageBuffer = await step.run('generate-image', async () => {
      const buf = await generateImage(prompt, format as CreativeFormat)
      return Array.from(buf)
    })

    const processedBuffer = await step.run('post-process', async () => {
      const buf = Buffer.from(imageBuffer)
      const processed = await postProcess(buf, format as CreativeFormat)
      return Array.from(processed)
    })

    const uploadResult = await step.run('upload', async () => {
      const buf = Buffer.from(processedBuffer)
      const key = `${creativeId}/${nanoid()}.jpg`
      return uploadAsset(buf, key, 'image/jpeg')
    })

    await step.run('mark-completed', async () => {
      await prisma.creative.update({
        where: { id: creativeId },
        data: { status: 'COMPLETED', url: uploadResult.url, key: uploadResult.key },
      })
    })
  }
)
