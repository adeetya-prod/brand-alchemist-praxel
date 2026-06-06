'use server'
import { prisma } from '@/lib/prisma'
import { getBrand } from '@/lib/db/brands'
import { R2_PUBLIC_URL } from '@/lib/r2'
import type { BrandAssetType } from '@prisma/client'

export async function saveBrandAsset(input: {
  brandId: string
  key: string
  type: BrandAssetType
  mimeType: string
  sizeBytes: number
}) {
  await getBrand(input.brandId)
  const asset = await prisma.brandAsset.create({
    data: {
      brandId: input.brandId,
      type: input.type,
      url: `${R2_PUBLIC_URL}/${input.key}`,
      key: input.key,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    },
  })
  return asset
}
