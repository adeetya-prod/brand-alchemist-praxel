'use client'
import { useEffect, useState } from 'react'
import { getGuidelineStatus } from '@/app/actions/extract-brand-pdf'
import { useRouter } from 'next/navigation'

type ExtractedData = {
  colors?: Array<{ hex: string; name: string }>
  fonts?: Array<{ name: string }>
  toneKeywords?: string[]
  tagline?: string
}

export default function ExtractionStatus({ guidelineId, brandId }: { guidelineId: string; brandId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<string>('PENDING')
  const [data, setData] = useState<ExtractedData | null>(null)

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED') return
    const interval = setInterval(async () => {
      const result = await getGuidelineStatus(guidelineId)
      setStatus(result.status)
      if (result.extractedData) setData(result.extractedData as ExtractedData)
    }, 3000)
    return () => clearInterval(interval)
  }, [guidelineId, status])

  if (status === 'FAILED') {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">
        Extraction failed. The brand profile was not updated.
      </div>
    )
  }

  if (status === 'COMPLETED' && data) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="font-medium text-green-800 mb-3">✓ Brand identity extracted!</p>
        <div className="space-y-2 text-sm">
          {data.colors && data.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Colors:</span>
              {data.colors.slice(0, 5).map((c, i) => (
                <div key={i} className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: c.hex }} title={c.hex} />
              ))}
            </div>
          )}
          {data.fonts && data.fonts.length > 0 && (
            <p className="text-gray-600">Fonts: {data.fonts.map(f => f.name).join(', ')}</p>
          )}
          {data.toneKeywords && data.toneKeywords.length > 0 && (
            <p className="text-gray-600">Tone: {data.toneKeywords.join(', ')}</p>
          )}
        </div>
        <button
          onClick={() => router.push(`/brands/${brandId}`)}
          className="mt-3 bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          View Brand Profile →
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-800 text-sm font-medium">
          {status === 'PENDING' ? 'Queued...' : 'Extracting brand identity...'}
        </p>
      </div>
      <p className="text-blue-600 text-xs mt-1">This usually takes 15–30 seconds.</p>
    </div>
  )
}
