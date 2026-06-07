'use server'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'
import { getBrand, updateBrand } from '@/lib/db/brands'
import { getCurrentUser } from '@/lib/dal'
import type { ReviewableExtraction } from '@/lib/extraction'

export async function triggerPdfExtraction(brandId: string, assetKey: string) {
  await getCurrentUser()
  await getBrand(brandId)
  const guideline = await prisma.brandGuideline.create({
    data: { brandId, source: 'PDF', status: 'PENDING' },
  })
  try {
    await inngest.send({ name: 'brand/pdf.extract.requested', data: { brandId, guidelineId: guideline.id, assetKey } })
  } catch (err) {
    console.error('[inngest] pdf extract send failed:', err)
    await prisma.brandGuideline.update({ where: { id: guideline.id }, data: { status: 'FAILED' } })
    return { guidelineId: guideline.id, error: 'Job queue unavailable. Please try again.' }
  }
  return { guidelineId: guideline.id }
}

export async function getGuidelineStatus(guidelineId: string) {
  await getCurrentUser()
  const guideline = await prisma.brandGuideline.findUnique({
    where: { id: guidelineId },
    select: { status: true, extractedData: true, source: true },
  })
  if (!guideline) throw new Error('Not found')
  return { status: guideline.status, extractedData: guideline.extractedData, source: guideline.source }
}

export async function applyExtractedBrand(brandId: string, data: ReviewableExtraction) {
  await getCurrentUser()
  // Strip empty strings — never overwrite existing Brand data with empty values
  const patch: Record<string, unknown> = {}
  if (data.primaryColor) patch.primaryColor = data.primaryColor
  if (data.secondaryColor) patch.secondaryColor = data.secondaryColor
  if (data.accentColor) patch.accentColor = data.accentColor
  if (data.fontHeading) patch.fontHeading = data.fontHeading
  if (data.fontBody) patch.fontBody = data.fontBody
  if (data.tone.length > 0) patch.tone = data.tone
  if (data.tagline) patch.tagline = data.tagline
  if (Object.keys(patch).length === 0) return
  await updateBrand(brandId, patch)
}
