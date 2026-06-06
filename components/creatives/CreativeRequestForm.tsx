'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestBatchCreativeGeneration } from '@/app/actions/creatives'

type Format = 'INSTAGRAM_SQUARE' | 'INSTAGRAM_STORY' | 'LINKEDIN_POST' | 'LINKEDIN_BANNER'

const FORMATS: { value: Format; label: string; desc: string; aspect: string }[] = [
  { value: 'INSTAGRAM_SQUARE', label: 'Instagram Square', desc: 'Feed post', aspect: '1:1' },
  { value: 'INSTAGRAM_STORY', label: 'Instagram Story', desc: 'Full-screen vertical', aspect: '9:16' },
  { value: 'LINKEDIN_POST', label: 'LinkedIn Post', desc: 'Feed image', aspect: '1.91:1' },
  { value: 'LINKEDIN_BANNER', label: 'LinkedIn Banner', desc: 'Profile banner', aspect: '4:1' },
]

export default function CreativeRequestForm({ brandId, brandName }: { brandId: string; brandName: string }) {
  const router = useRouter()
  const [selectedFormats, setSelectedFormats] = useState<Format[]>(['INSTAGRAM_SQUARE'])
  const [brief, setBrief] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleFormat(format: Format) {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    )
  }

  const totalCreatives = selectedFormats.length * 2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedFormats.length === 0) { setError('Select at least one format.'); return }
    setError(null)
    setSubmitting(true)
    try {
      const result = await requestBatchCreativeGeneration({
        brandId,
        formats: selectedFormats,
        brief: brief || undefined,
      })
      if ('error' in result) {
        setError('Failed to start generation. Please try again.')
        return
      }
      router.push(`/brands/${brandId}/creatives`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Formats</label>
        <p className="text-xs text-gray-400 mb-3">Each format generates 2 variants. Select one or more.</p>
        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map(f => {
            const checked = selectedFormats.includes(f.value)
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFormat(f.value)}
                className={`p-4 rounded-xl border-2 text-left transition-colors relative ${checked ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                {checked && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <p className={`font-medium text-sm ${checked ? 'text-brand-700' : 'text-gray-800'}`}>{f.label}</p>
                <p className="text-xs text-gray-500">{f.desc} · {f.aspect}</p>
              </button>
            )
          })}
        </div>
        {selectedFormats.length === 0 && (
          <p className="text-xs text-red-500 mt-1">Select at least one format.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Creative Brief (optional)</label>
        <textarea
          value={brief}
          onChange={e => setBrief(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. Promote our summer sale with 30% off. Use warm, energetic colors."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">{brief.length}/500</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting || selectedFormats.length === 0}
        className="w-full bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? 'Queuing generation...'
          : totalCreatives > 0
            ? `Generate ${totalCreatives} creative${totalCreatives !== 1 ? 's' : ''}`
            : 'Select a format'}
      </button>
      <p className="text-xs text-gray-400 text-center">
        {totalCreatives > 0 && `${selectedFormats.length} format${selectedFormats.length > 1 ? 's' : ''} × 2 variants = ${totalCreatives} images. `}
        Generation typically takes 20–40 seconds per image.
      </p>
    </form>
  )
}
