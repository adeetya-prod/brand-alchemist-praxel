'use server'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'
import { getBrand } from '@/lib/db/brands'
import { getCurrentUser } from '@/lib/dal'

const PRIVATE_IP_RE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/

function isPrivateUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr)
    return PRIVATE_IP_RE.test(u.hostname) || u.hostname === 'localhost'
  } catch { return true }
}

export async function triggerWebsiteExtraction(brandId: string, url: string) {
  await getCurrentUser()
  if (!url.startsWith('https://')) throw new Error('URL must start with https://')
  if (isPrivateUrl(url)) throw new Error('Private or local URLs are not allowed')
  await getBrand(brandId)
  const guideline = await prisma.brandGuideline.create({
    data: { brandId, source: 'WEBSITE', status: 'PENDING' },
  })
  await prisma.brand.update({ where: { id: brandId }, data: { sourceUrl: url } })
  try {
    await inngest.send({ name: 'brand/website.extract.requested', data: { brandId, guidelineId: guideline.id, url } })
  } catch (err) {
    console.error('[inngest] website extract send failed:', err)
    await prisma.brandGuideline.update({ where: { id: guideline.id }, data: { status: 'FAILED' } })
    return { guidelineId: guideline.id, error: 'Job queue unavailable. Please try again.' }
  }
  return { guidelineId: guideline.id }
}
