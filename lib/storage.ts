import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET, R2_PUBLIC_URL } from './r2'
import fs from 'fs/promises'
import path from 'path'

const IS_R2_CONFIGURED =
  !!process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_ACCESS_KEY_ID !== 'your_r2_access_key' &&
  !!process.env.CF_ACCOUNT_ID &&
  process.env.CF_ACCOUNT_ID !== 'your_account_id'

export async function uploadAsset(buffer: Buffer, key: string, contentType: string) {
  if (IS_R2_CONFIGURED) {
    await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: contentType }))
    return { url: `${R2_PUBLIC_URL}/${key}`, key }
  }
  const localPath = path.join(process.cwd(), 'public', 'uploads', key)
  await fs.mkdir(path.dirname(localPath), { recursive: true })
  await fs.writeFile(localPath, buffer)
  return { url: `/uploads/${key}`, key }
}

export async function getAssetBuffer(key: string): Promise<Buffer> {
  if (IS_R2_CONFIGURED) {
    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return Buffer.from(await obj.Body!.transformToByteArray())
  }
  const localPath = path.join(process.cwd(), 'public', 'uploads', key)
  return fs.readFile(localPath)
}
