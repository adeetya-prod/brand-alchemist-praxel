'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCreativeStatus, editCreativePrompt, retryCreative } from '@/app/actions/creatives'
import Link from 'next/link'

type Props = {
  creativeId: string
  brandId: string
  initialStatus: string
  initialUrl: string | null
  format: string
  prompt: string
  editedPrompt?: string | null
}

const FORMAT_LABEL: Record<string, string> = {
  INSTAGRAM_SQUARE: 'Instagram Square (1080×1080)',
  INSTAGRAM_STORY: 'Instagram Story (1080×1920)',
  LINKEDIN_POST: 'LinkedIn Post (1200×628)',
  LINKEDIN_BANNER: 'LinkedIn Banner (1584×396)',
}

const DOWNLOAD_FORMATS = [
  { label: 'Download JPG', value: 'jpg' },
  { label: 'Download PNG', value: 'png' },
  { label: 'Download WebP', value: 'webp' },
]

export default function CreativeViewer({ creativeId, brandId, initialStatus, initialUrl, format, prompt, editedPrompt }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [url, setUrl] = useState(initialUrl)
  const [refineOpen, setRefineOpen] = useState(false)
  const [refinePrompt, setRefinePrompt] = useState(editedPrompt ?? prompt)
  const [refining, setRefining] = useState(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED') return
    const interval = setInterval(async () => {
      const result = await getCreativeStatus(creativeId)
      setStatus(result.status)
      if (result.url) setUrl(result.url)
    }, 3000)
    return () => clearInterval(interval)
  }, [creativeId, status])

  async function handleRefine() {
    if (!refinePrompt.trim()) return
    setRefining(true)
    try {
      const result = await editCreativePrompt(creativeId, refinePrompt)
      if ('newCreativeId' in result) {
        router.push(`/brands/${result.brandId}/creatives/${result.newCreativeId}`)
      }
    } finally {
      setRefining(false)
    }
  }

  async function handleRetry() {
    setRetrying(true)
    try {
      await retryCreative(creativeId)
      setStatus('PENDING')
    } finally {
      setRetrying(false)
    }
  }

  if (status === 'FAILED') {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200 text-center">
        <p className="text-red-600 font-medium mb-2">Generation failed</p>
        <p className="text-sm text-gray-500 mb-4">Something went wrong generating this creative.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
          >
            {retrying ? 'Retrying...' : 'Retry'}
          </button>
          <Link href={`/brands/${brandId}/creatives/new`} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            New Creative
          </Link>
        </div>
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
        <img src={url} alt="Generated creative" className="w-full h-auto block" />
      </div>

      <p className="text-sm text-gray-500 text-center">{FORMAT_LABEL[format] || format}</p>

      {/* Download buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {DOWNLOAD_FORMATS.map(fmt => (
          <a
            key={fmt.value}
            href={`/api/creatives/${creativeId}/download?format=${fmt.value}`}
            download
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            {fmt.label}
          </a>
        ))}
        <Link href={`/brands/${brandId}/creatives/new`} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm">
          Generate Another
        </Link>
        <Link href={`/brands/${brandId}`} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm">
          Back to Brand
        </Link>
      </div>

      {/* Prompt refinement panel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setRefineOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>✨ Refine this creative</span>
          <span className="text-gray-400">{refineOpen ? '▲' : '▼'}</span>
        </button>
        {refineOpen && (
          <div className="px-5 pb-5 space-y-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 pt-3">Edit the prompt to generate a new variation. The original is preserved.</p>
            <textarea
              value={refinePrompt}
              onChange={e => setRefinePrompt(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleRefine}
              disabled={refining || !refinePrompt.trim()}
              className="bg-brand-600 text-white px-5 py-2 rounded-lg hover:bg-brand-700 text-sm font-medium disabled:opacity-50"
            >
              {refining ? 'Generating variation...' : 'Generate variation'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
