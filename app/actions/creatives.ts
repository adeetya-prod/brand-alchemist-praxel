'use server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'
import { getCurrentUser } from '@/lib/dal'
import { getBrand } from '@/lib/db/brands'
import { buildPrompt } from '@/lib/prompts'
import type { CreativeFormat } from '@prisma/client'
import { after } from 'next/server'

const FORMAT_VALUES = ['INSTAGRAM_SQUARE', 'INSTAGRAM_STORY', 'LINKEDIN_POST', 'LINKEDIN_BANNER'] as const

const RequestSchema = z.object({
  brandId: z.string().min(1),
  format: z.enum(FORMAT_VALUES),
  brief: z.string().max(500).optional(),
})

const BatchRequestSchema = z.object({
  brandId: z.string().min(1),
  formats: z.array(z.enum(FORMAT_VALUES)).min(1),
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

export async function requestBatchCreativeGeneration(input: z.infer<typeof BatchRequestSchema>) {
  await getCurrentUser()
  const parsed = BatchRequestSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const brand = await getBrand(parsed.data.brandId)
  const { formats, brief, brandId } = parsed.data

  // Create all Creative rows in one transaction
  const rows = await prisma.$transaction(
    formats.flatMap(format =>
      [0, 1].map(variantIndex =>
        prisma.creative.create({
          data: {
            brandId,
            format,
            prompt: buildPrompt(brand as any, format as CreativeFormat, brief, variantIndex),
            variantIndex,
            status: 'PENDING',
          },
        })
      )
    )
  )

  // Batch-send all Inngest events in a single HTTP call
  await inngest.send(
    rows.map(row => ({
      name: 'creative/generate.requested' as const,
      data: { creativeId: row.id, brandId, format: row.format, prompt: row.prompt },
    }))
  )

  // When Inngest is in local/dev mode without a dev server, run generation directly
  // after the response is sent so the user isn't blocked waiting
  if (!process.env.INNGEST_EVENT_KEY || process.env.INNGEST_EVENT_KEY === 'local') {
    const rowSnapshot = rows.map(r => ({ id: r.id, format: r.format as CreativeFormat, prompt: r.prompt }))
    after(async () => {
      const { runLocalGeneration } = await import('@/lib/local-generation')
      for (const row of rowSnapshot) {
        await runLocalGeneration(row.id, row.format, row.prompt)
      }
    })
  }

  return { brandId, count: rows.length }
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

export async function getCreativesForBrand(brandId: string) {
  await getCurrentUser()
  const brand = await prisma.brand.findFirst({ where: { id: brandId } })
  if (!brand) throw new Error('Not found')
  return prisma.creative.findMany({
    where: { brandId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, format: true, status: true, url: true, variantIndex: true, parentCreativeId: true, prompt: true, editedPrompt: true, createdAt: true },
  })
}

export async function editCreativePrompt(creativeId: string, newPrompt: string) {
  await getCurrentUser()
  const original = await prisma.creative.findFirst({
    where: { id: creativeId, brand: { userId: (await getCurrentUser()) } },
  })
  if (!original) throw new Error('Not found')

  const siblingsCount = await prisma.creative.count({ where: { parentCreativeId: creativeId } })

  const newCreative = await prisma.creative.create({
    data: {
      brandId: original.brandId,
      format: original.format,
      prompt: newPrompt,
      editedPrompt: newPrompt,
      parentCreativeId: creativeId,
      variantIndex: siblingsCount,
      status: 'PENDING',
    },
  })

  await inngest.send({
    name: 'creative/generate.requested',
    data: { creativeId: newCreative.id, brandId: original.brandId, format: original.format, prompt: newPrompt },
  })

  if (!process.env.INNGEST_EVENT_KEY || process.env.INNGEST_EVENT_KEY === 'local') {
    const id = newCreative.id
    const fmt = original.format as CreativeFormat
    after(async () => {
      const { runLocalGeneration } = await import('@/lib/local-generation')
      await runLocalGeneration(id, fmt, newPrompt)
    })
  }

  return { newCreativeId: newCreative.id, brandId: original.brandId }
}
