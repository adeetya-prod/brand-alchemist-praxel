import { inngest } from '@/lib/inngest'
import { openaiImages } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { uploadAsset } from '@/lib/storage'
import { composeCreative, GENERATE_SIZES } from '@/lib/image-processing'
import { nanoid } from 'nanoid'
import type { CreativeFormat } from '@prisma/client'

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
    const { creativeId, brandId, format, prompt } = event.data

    await step.run('mark-processing', async () => {
      await prisma.creative.update({ where: { id: creativeId }, data: { status: 'PROCESSING' } })
    })

    // Fetch brand identity and CTA label for compositing
    const compositeData = await step.run('fetch-brand-data', async () => {
      const [brand, creative] = await Promise.all([
        prisma.brand.findUniqueOrThrow({ where: { id: brandId } }),
        prisma.creative.findUniqueOrThrow({ where: { id: creativeId }, select: { ctaLabel: true } }),
      ])
      return {
        primaryColor: brand.primaryColor,
        logoUrl: brand.logoUrl,
        fontHeading: brand.fontHeading,
        ctaLabel: creative.ctaLabel,
      }
    })

    const imageBuffer = await step.run('generate-image', async () => {
      const buf = await generateImage(prompt, format as CreativeFormat)
      return Array.from(buf)
    })

    const processedBuffer = await step.run('post-process', async () => {
      const buf = Buffer.from(imageBuffer)
      const processed = await composeCreative(buf, format as CreativeFormat, compositeData, compositeData.ctaLabel)
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
