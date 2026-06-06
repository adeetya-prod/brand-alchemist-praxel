'use client'
import { useEffect, useState } from 'react'
import { getCreativeStatus } from '@/app/actions/creatives'
import Link from 'next/link'

type Props = {
  creativeId: string
  brandId: string
  initialStatus: string
  initialUrl: string | null
  format: string
}

const FORMAT_LABEL: Record<string, string> = {
  INSTAGRAM_SQUARE: 'Instagram Square (1080×1080)',
  INSTAGRAM_STORY: 'Instagram Story (1080×1920)',
  LINKEDIN_POST: 'LinkedIn Post (1200×628)',
  LINKEDIN_BANNER: 'LinkedIn Banner (1584×396)',
}

export default function CreativeViewer({ creativeId, brandId, initialStatus, initialUrl, format }: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [url, setUrl] = useState(initialUrl)

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED') return
    const interval = setInterval(async () => {
      const result = await getCreativeStatus(creativeId)
      setStatus(result.status)
      if (result.url) setUrl(result.url)
    }, 3000)
    return () => clearInterval(interval)
  }, [creativeId, status])

  if (status === 'FAILED') {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-center">
        <p className="text-red-600 font-medium mb-2">Generation failed</p>
        <p className="text-sm text-gray-500 mb-4">Something went wrong. Please try again.</p>
        <Link href={`/brands/${brandId}/creatives/new`} className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 text-sm font-medium">
          Try Again
        </Link>
      </div>
    )
  }

  if (status !== 'COMPLETED' || !url) {
    return (
      <div className="p-8 bg-white rounded-xl border border-gray-200 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-1">
          {status === 'PENDING' ? 'Queued...' : 'Generating your creative...'}
        </p>
        <p className="text-sm text-gray-400">This usually takes 20–40 seconds.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="relative w-full">
          <img src={url} alt="Generated creative" className="w-full h-auto block" />
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center">{FORMAT_LABEL[format] || format}</p>
      <div className="flex gap-3 justify-center">
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 font-medium text-sm"
        >
          Download
        </a>
        <Link href={`/brands/${brandId}/creatives/new`} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm">
          Generate Another
        </Link>
        <Link href={`/brands/${brandId}`} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm">
          Back to Brand
        </Link>
      </div>
    </div>
  )
}
