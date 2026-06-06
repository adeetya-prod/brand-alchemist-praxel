'use server'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'
import { getBrand } from '@/lib/db/brands'
import { getCurrentUser } from '@/lib/dal'

export async function triggerPdfExtraction(brandId: string, assetKey: string) {
  await getCurrentUser()
  await getBrand(brandId)
  const guideline = await prisma.brandGuideline.create({
    data: { brandId, source: 'PDF', status: 'PENDING' },
  })
  await inngest.send({ name: 'brand/pdf.extract.requested', data: { brandId, guidelineId: guideline.id, assetKey } })
  return { guidelineId: guideline.id }
}

export async function getGuidelineStatus(guidelineId: string) {
  await getCurrentUser()
  const guideline = await prisma.brandGuideline.findUnique({
    where: { id: guidelineId },
    select: { status: true, extractedData: true },
  })
  if (!guideline) throw new Error('Not found')
  return { status: guideline.status, extractedData: guideline.extractedData }
}

export async function applyExtractedBrand(brandId: string, data: Record<string, unknown>) {
  await getCurrentUser()
  const { updateBrand } = await import('@/lib/db/brands')
  await updateBrand(brandId, data)
}
