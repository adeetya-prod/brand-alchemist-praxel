import { prisma } from './prisma'
import { openaiImages } from './openai'
import { uploadAsset } from './storage'
import { composeCreative, GENERATE_SIZES } from './image-processing'
import { nanoid } from 'nanoid'
import type { CreativeFormat } from '@prisma/client'

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

    const response = await openaiImages.images.generate({
      model: 'openai/dall-e-3',
      prompt,
      n: 1,
      size: `${width}x${height}` as any,
      response_format: 'b64_json',
    })
    const b64 = response.data?.[0]?.b64_json
    if (!b64) throw new Error('No image data returned from OpenRouter')
    const rawBuffer = Buffer.from(b64, 'base64')

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
