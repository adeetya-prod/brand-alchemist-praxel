'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCreativeStatus, retryCreative } from '@/app/actions/creatives'
import type { Creative } from '@prisma/client'

const FORMAT_LABEL: Record<string, string> = {
  INSTAGRAM_SQUARE: 'Instagram Square',
  INSTAGRAM_STORY: 'Instagram Story',
  LINKEDIN_POST: 'LinkedIn Post',
  LINKEDIN_BANNER: 'LinkedIn Banner',
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-600',
}

export default function CreativeCard({ creative: initial, brandId }: { creative: Creative; brandId: string }) {
  const [status, setStatus] = useState(initial.status)
  const [url, setUrl] = useState(initial.url)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED') return
    const interval = setInterval(async () => {
      const result = await getCreativeStatus(initial.id)
      setStatus(result.status)
      if (result.url) setUrl(result.url)
    }, 5000)
    return () => clearInterval(interval)
  }, [initial.id, status])

  async function handleRetry() {
    setRetrying(true)
    try {
      await retryCreative(initial.id)
      setStatus('PENDING')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-brand-200 hover:shadow-sm transition-all">
      {/* Image / placeholder */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
        {status === 'COMPLETED' && url ? (
          <img src={url} alt={FORMAT_LABEL[initial.format] || initial.format} className="w-full h-full object-cover" />
        ) : status === 'FAILED' ? (
          <div className="text-center p-4">
            <p className="text-red-400 text-sm font-medium mb-2">Generation failed</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="text-xs bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="w-8 h-8 border-3 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-xs">{status === 'PENDING' ? 'Queued' : 'Generating...'}</p>
          </div>
        )}
        {/* Status badge overlay */}
        {status !== 'COMPLETED' && (
          <div className="absolute top-2 right-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[status]}`}>{status}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4">
        <p className="text-sm font-medium text-gray-800 mb-1">{FORMAT_LABEL[initial.format] || initial.format}</p>
        <p className="text-xs text-gray-400 mb-3">{new Date(initial.createdAt).toLocaleDateString()}</p>
        <div className="flex gap-2">
          <Link href={`/brands/${brandId}/creatives/${initial.id}`} className="text-xs text-brand-600 hover:text-brand-700 font-medium border border-brand-200 px-2 py-1 rounded-lg">
            View
          </Link>
          {status === 'COMPLETED' && url && (
            <a href={url} download target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 px-2 py-1 rounded-lg">
              Download
            </a>
          )}
          <Link href={`/brands/${brandId}/creatives/new`} className="text-xs text-gray-600 hover:text-gray-800 font-medium border border-gray-200 px-2 py-1 rounded-lg ml-auto">
            + New
          </Link>
        </div>
      </div>
    </div>
  )
}
