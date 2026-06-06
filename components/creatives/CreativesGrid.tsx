'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getCreativesForBrand } from '@/app/actions/creatives'

type Creative = Awaited<ReturnType<typeof getCreativesForBrand>>[number]

const FORMAT_LABEL: Record<string, string> = {
  INSTAGRAM_SQUARE: 'Instagram Square',
  INSTAGRAM_STORY: 'Instagram Story',
  LINKEDIN_POST: 'LinkedIn Post',
  LINKEDIN_BANNER: 'LinkedIn Banner',
}

// Aspect ratio CSS padding for skeleton placeholder sizing
const FORMAT_ASPECT: Record<string, string> = {
  INSTAGRAM_SQUARE: '100%',
  INSTAGRAM_STORY: '177.8%',
  LINKEDIN_POST: '52.4%',
  LINKEDIN_BANNER: '33.3%',
}

const DOWNLOAD_FORMATS = [
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'WebP', value: 'webp' },
]

function SkeletonCard({ format }: { format: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="relative bg-gray-100 animate-pulse" style={{ paddingBottom: FORMAT_ASPECT[format] ?? '100%' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-brand-400 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-xs">Generating...</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-2.5 bg-gray-100 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  )
}

function CreativeCardItem({ creative, brandId }: { creative: Creative; brandId: string }) {
  const [visible, setVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (creative.status !== 'COMPLETED') return
    const el = imgRef.current
    if (!el) return
    requestAnimationFrame(() => setVisible(true))
  }, [creative.status])

  if (creative.status !== 'COMPLETED' && creative.status !== 'FAILED') {
    return <SkeletonCard format={creative.format} />
  }

  return (
    <div
      ref={imgRef}
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-97'}`}
    >
      <div className="relative bg-gray-50 overflow-hidden" style={{ paddingBottom: FORMAT_ASPECT[creative.format] ?? '100%' }}>
        {creative.status === 'COMPLETED' && creative.url ? (
          <img
            src={creative.url}
            alt={FORMAT_LABEL[creative.format] || creative.format}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-xs font-medium">Generation failed</p>
          </div>
        )}
        {creative.variantIndex > 0 && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            Variant {creative.variantIndex + 1}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm font-medium text-gray-800 mb-0.5">{FORMAT_LABEL[creative.format] || creative.format}</p>
        <p className="text-xs text-gray-400 mb-3">{new Date(creative.createdAt).toLocaleDateString()}</p>

        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/brands/${brandId}/creatives/${creative.id}`}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium border border-brand-200 px-2 py-1 rounded-lg"
          >
            View & Edit
          </Link>

          {creative.status === 'COMPLETED' && creative.url && (
            <div className="relative group">
              <button className="text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1">
                Download ▾
              </button>
              <div className="hidden group-hover:flex absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg flex-col overflow-hidden z-10">
                {DOWNLOAD_FORMATS.map(fmt => (
                  <a
                    key={fmt.value}
                    href={`/api/creatives/${creative.id}/download?format=${fmt.value}`}
                    download
                    className="text-xs text-gray-700 hover:bg-brand-50 hover:text-brand-700 px-3 py-2 whitespace-nowrap"
                  >
                    {fmt.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CreativesGrid({
  initialCreatives,
  brandId,
}: {
  initialCreatives: Creative[]
  brandId: string
}) {
  const [creatives, setCreatives] = useState(initialCreatives)

  const allDone = creatives.every(c => c.status === 'COMPLETED' || c.status === 'FAILED')

  useEffect(() => {
    if (allDone) return
    const interval = setInterval(async () => {
      const fresh = await getCreativesForBrand(brandId)
      setCreatives(fresh)
    }, 3000)
    return () => clearInterval(interval)
  }, [brandId, allDone])

  if (creatives.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">No creatives generated yet.</p>
        <Link href={`/brands/${brandId}/creatives/new`} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 font-medium">
          Generate First Creative
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {creatives.map(creative => (
        <CreativeCardItem key={creative.id} creative={creative} brandId={brandId} />
      ))}
    </div>
  )
}
