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
  ctaLabel: z.string().min(1),
  tone: z.string().min(1),
  intent: z.string().min(1),
  additionalContext: z.string().max(300).optional(),
})

// Sends Inngest events for creative generation with after() fallback.
// If Inngest is not configured or fails, generation runs directly via after().
async function dispatchCreativeJobs(
  rows: Array<{ id: string; brandId: string; format: string; prompt: string }>
) {
  const isLocal = !process.env.INNGEST_EVENT_KEY || process.env.INNGEST_EVENT_KEY === 'local'
  let useFallback = isLocal

  if (!isLocal) {
    try {
      await inngest.send(
        rows.map(row => ({
          name: 'creative/generate.requested' as const,
          data: { creativeId: row.id, brandId: row.brandId, format: row.format, prompt: row.prompt },
        }))
      )
    } catch (err) {
      console.error('[inngest] creative send failed, falling back to after():', err)
      useFallback = true
    }
  }

  if (useFallback) {
    const snapshot = rows.map(r => ({ id: r.id, format: r.format as CreativeFormat, prompt: r.prompt }))
    after(async () => {
      const { runLocalGeneration } = await import('@/lib/local-generation')
      for (const row of snapshot) {
        await runLocalGeneration(row.id, row.format, row.prompt)
      }
    })
  }
}

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

  await dispatchCreativeJobs([{ id: creative.id, brandId: parsed.data.brandId, format: parsed.data.format, prompt }])
  return { creativeId: creative.id }
}

export async function requestBatchCreativeGeneration(input: z.infer<typeof BatchRequestSchema>) {
  await getCurrentUser()
  const parsed = BatchRequestSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const brand = await getBrand(parsed.data.brandId)
  const { formats, brief, brandId, ctaLabel, tone, intent, additionalContext } = parsed.data
  const briefOptions = { ctaLabel, tone, intent, additionalContext }

  const rows = await prisma.$transaction(
    formats.flatMap(format =>
      [0, 1].map(variantIndex =>
        prisma.creative.create({
          data: {
            brandId,
            format,
            prompt: buildPrompt(brand as any, format as CreativeFormat, brief, variantIndex, briefOptions),
            variantIndex,
            ctaLabel,
            tone,
            intent,
            status: 'PENDING',
          },
        })
      )
    )
  )

  await dispatchCreativeJobs(rows.map(r => ({ id: r.id, brandId, format: r.format, prompt: r.prompt })))
  return { brandId, count: rows.length }
}

export async function retryCreative(creativeId: string) {
  const userId = await getCurrentUser()
  const creative = await prisma.creative.findFirst({
    where: { id: creativeId, brand: { userId } },
    select: { id: true, brandId: true, format: true, prompt: true, status: true },
  })
  if (!creative) throw new Error('Not found')
  if (creative.status !== 'FAILED' && creative.status !== 'PENDING') {
    return { creativeId: creative.id }
  }

  await prisma.creative.update({ where: { id: creativeId }, data: { status: 'PENDING' } })
  await dispatchCreativeJobs([{ id: creative.id, brandId: creative.brandId, format: creative.format, prompt: creative.prompt }])
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

export async function getCreativesForBrand(brandId: string) {
  await getCurrentUser()
  const brand = await prisma.brand.findFirst({ where: { id: brandId } })
  if (!brand) throw new Error('Not found')
  return prisma.creative.findMany({
    where: { brandId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, format: true, status: true, url: true, variantIndex: true, parentCreativeId: true, prompt: true, editedPrompt: true, ctaLabel: true, tone: true, intent: true, createdAt: true },
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

  await dispatchCreativeJobs([{ id: newCreative.id, brandId: original.brandId, format: original.format, prompt: newPrompt }])
  return { newCreativeId: newCreative.id, brandId: original.brandId }
}
