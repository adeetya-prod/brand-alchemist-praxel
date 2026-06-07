import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from './r2'

const IS_R2_CONFIGURED =
  !!process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_ACCESS_KEY_ID !== 'your_r2_access_key' &&
  !!process.env.CF_ACCOUNT_ID &&
  process.env.CF_ACCOUNT_ID !== 'your_account_id'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_BUCKET = 'creatives'

async function uploadToSupabase(buffer: Buffer, key: string, contentType: string) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: buffer as unknown as BodyInit,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase upload failed: ${res.status} ${text}`)
  }
  const url = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${key}`
  return { url, key }
}

async function getFromSupabase(key: string): Promise<Buffer> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${key}`, {
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  })
  if (!res.ok) throw new Error(`Supabase download failed: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

export async function uploadAsset(buffer: Buffer, key: string, contentType: string) {
  if (IS_R2_CONFIGURED) {
    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: contentType }))
    return { url: `${R2_PUBLIC_URL}/${key}`, key }
  }
  return uploadToSupabase(buffer, key, contentType)
}

export async function getAssetBuffer(key: string): Promise<Buffer> {
  if (IS_R2_CONFIGURED) {
    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return Buffer.from(await obj.Body!.transformToByteArray())
  }
  return getFromSupabase(key)
}
