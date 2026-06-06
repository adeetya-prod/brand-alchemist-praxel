'use server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'
import { getCurrentUser } from '@/lib/dal'
import { getBrand } from '@/lib/db/brands'
import { buildPrompt } from '@/lib/prompts'
import type { CreativeFormat } from '@prisma/client'

const RequestSchema = z.object({
  brandId: z.string().min(1),
  format: z.enum(['INSTAGRAM_SQUARE', 'INSTAGRAM_STORY', 'LINKEDIN_POST', 'LINKEDIN_BANNER']),
  brief: z.string().max(500).optional(),
})

export async function requestCreativeGeneration(input: z.infer<typeof RequestSchema>) {
  await getCurrentUser()
  const parsed = RequestSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const brand = await getBrand(parsed.data.brandId)
  const prompt = buildPrompt(brand as any, parsed.data.format as CreativeFormat, parsed.data.brief)

  const creative = await prisma.creative.create({
    data: {
      brandId: parsed.data.brandId,
      format: parsed.data.format,
      prompt,
      status: 'PENDING',
    },
  })

  await inngest.send({
    name: 'creative/generate.requested',
    data: { creativeId: creative.id, brandId: parsed.data.brandId, format: parsed.data.format, prompt },
  })

  return { creativeId: creative.id }
}

export async function getCreativeStatus(creativeId: string) {
  await getCurrentUser()
  const creative = await prisma.creative.findUnique({
    where: { id: creativeId },
    select: { status: true, url: true, format: true },
  })
  if (!creative) throw new Error('Not found')
  return creative
}
