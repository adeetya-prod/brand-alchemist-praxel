'use server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getCurrentUser } from '@/lib/dal'
import { getBrand } from '@/lib/db/brands'
import { r2, R2_BUCKET } from '@/lib/r2'
import { nanoid } from 'nanoid'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf', 'font/ttf', 'font/otf', 'image/webp']
const MAX_SIZE = 20 * 1024 * 1024

export async function getUploadUrl(fileName: string, contentType: string, sizeBytes: number, brandId: string) {
  const userId = await getCurrentUser()
  await getBrand(brandId)
  if (!ALLOWED_TYPES.includes(contentType)) throw new Error('File type not allowed')
  if (sizeBytes > MAX_SIZE) throw new Error('File too large (max 20MB)')
  const key = `${userId}/${brandId}/${nanoid()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType })
  const url = await getSignedUrl(r2, command, { expiresIn: 300 })
  return { url, key }
}
