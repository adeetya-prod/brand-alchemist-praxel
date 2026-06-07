'use server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getCurrentUser } from '@/lib/dal'
import { getBrand } from '@/lib/db/brands'
import { r2, R2_BUCKET } from '@/lib/r2'
import { nanoid } from 'nanoid'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf', 'font/ttf', 'font/otf', 'image/webp']
const MAX_SIZE = 20 * 1024 * 1024

const IS_R2_CONFIGURED =
  !!process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_ACCESS_KEY_ID !== 'your_r2_access_key' &&
  !!process.env.CF_ACCOUNT_ID &&
  process.env.CF_ACCOUNT_ID !== 'your_account_id'

export async function getUploadUrl(fileName: string, contentType: string, sizeBytes: number, brandId: string) {
  const userId = await getCurrentUser()
  await getBrand(brandId)
  if (!ALLOWED_TYPES.includes(contentType)) throw new Error('File type not allowed')
  if (sizeBytes > MAX_SIZE) throw new Error('File too large (max 20MB)')
  const key = `${userId}/${brandId}/${nanoid()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  if (IS_R2_CONFIGURED) {
    const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType })
    const url = await getSignedUrl(r2, command, { expiresIn: 300 })
    return { url, key }
  }

  // Supabase Storage fallback — signed upload URL for direct browser PUT
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/creatives/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Storage error: ${res.status} ${text}`)
  }
  const data = await res.json()
  return { url: `${SUPABASE_URL}${data.signedURL}`, key }
}
