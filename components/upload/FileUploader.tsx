'use client'
import { useState, useRef } from 'react'
import { getUploadUrl } from '@/app/actions/upload'
import { saveBrandAsset } from '@/app/actions/brand-assets'
import type { BrandAssetType } from '@prisma/client'

type Props = {
  brandId: string
  assetType: BrandAssetType
  accept: string
  label?: string
  onUploadComplete?: (key: string, url: string) => void
}

export default function FileUploader({ brandId, assetType, accept, label = 'Upload File', onUploadComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const { url, key } = await getUploadUrl(file.name, file.type, file.size, brandId)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)) }
        xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error('Upload failed'))
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
      await saveBrandAsset({ brandId, key, type: assetType, mimeType: file.type, sizeBytes: file.size })
      setDone(true)
      onUploadComplete?.(key, publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
        style={done
          ? { borderColor: 'rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.08)' }
          : { borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {done ? (
          <p className="text-green-400 font-medium">&#10003; Uploaded</p>
        ) : uploading ? (
          <div>
            <p className="text-white/60 text-sm mb-2">Uploading... {progress}%</p>
            <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }} />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-white/55 text-sm">{label}</p>
            <p className="text-white/30 text-xs mt-1">Click or drag &amp; drop</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
