'use client'
import { useState } from 'react'
import { triggerWebsiteExtraction } from '@/app/actions/extract-brand-website'
import ExtractionStatus from './ExtractionStatus'
import { DARK_INPUT_CLASS, DARK_INPUT_STYLE } from '@/lib/styles'

export default function WebsiteUrlExtractor({ brandId }: { brandId: string }) {
  const [url, setUrl] = useState('')
  const [guidelineId, setGuidelineId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await triggerWebsiteExtraction(brandId, url)
      setGuidelineId(result.guidelineId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start extraction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Enter your website URL. We'll scan your site's colors, fonts, and brand personality.
      </p>
      <p className="text-xs text-white/35">
        Best results from sites with server-rendered or static pages; the screenshot pass covers most modern SPAs.
      </p>
      {!guidelineId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            required
            className={DARK_INPUT_CLASS}
            style={DARK_INPUT_STYLE}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Starting extraction...' : 'Scan Website'}
          </button>
        </form>
      ) : (
        <ExtractionStatus guidelineId={guidelineId} brandId={brandId} />
      )}
    </div>
  )
}
