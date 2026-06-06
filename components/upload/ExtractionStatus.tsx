'use client'
import { useEffect, useState } from 'react'
import { getGuidelineStatus, applyExtractedBrand } from '@/app/actions/extract-brand-pdf'
import { normalizeExtractedData, type ReviewableExtraction } from '@/lib/extraction'
import { useRouter } from 'next/navigation'

const TONE_KEYWORDS = ['Professional', 'Playful', 'Bold', 'Minimalist', 'Warm', 'Edgy', 'Luxury', 'Casual']

export default function ExtractionStatus({ guidelineId, brandId }: { guidelineId: string; brandId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<string>('PENDING')
  const [source, setSource] = useState<'PDF' | 'WEBSITE'>('PDF')
  const [form, setForm] = useState<ReviewableExtraction>({
    primaryColor: '', secondaryColor: '', accentColor: '',
    fontHeading: '', fontBody: '', tone: [], tagline: '',
  })
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED') return
    const interval = setInterval(async () => {
      const result = await getGuidelineStatus(guidelineId)
      setStatus(result.status)
      if (result.status === 'COMPLETED' && result.extractedData) {
        const src = (result.source ?? 'PDF') as 'PDF' | 'WEBSITE'
        setSource(src)
        setForm(normalizeExtractedData(result.extractedData, src))
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [guidelineId, status])

  async function handleApply() {
    setApplying(true)
    try {
      await applyExtractedBrand(brandId, form)
      router.push(`/brands/${brandId}`)
    } finally {
      setApplying(false)
    }
  }

  if (status === 'FAILED') {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">
        Extraction failed. The Brand Space was not updated.
      </div>
    )
  }

  if (status === 'COMPLETED') {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="font-medium text-green-800 text-sm">
            ✓ Brand identity extracted — review and edit before applying
          </p>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Colors</h3>
          <div className="grid grid-cols-3 gap-4">
            {([
              { key: 'primaryColor', label: 'Primary' },
              { key: 'secondaryColor', label: 'Secondary' },
              { key: 'accentColor', label: 'Accent' },
            ] as const).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: form[key] || '#e5e7eb' }}
                  />
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="#000000"
                    maxLength={7}
                    className="w-full border border-gray-300 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Typography</h3>
          <div className="grid grid-cols-2 gap-4">
            {([
              { key: 'fontHeading', label: 'Heading font', placeholder: 'Playfair Display' },
              { key: 'fontBody', label: 'Body font', placeholder: 'Inter' },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Tone</h3>
          <div className="flex flex-wrap gap-2">
            {TONE_KEYWORDS.map(k => {
              const selected = form.tone.includes(k)
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    tone: selected ? f.tone.filter(t => t !== k) : [...f.tone, k],
                  }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-700 hover:border-brand-400'}`}
                >
                  {k}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tagline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Tagline</h3>
          <input
            type="text"
            value={form.tagline}
            onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
            placeholder="Your brand's tagline"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApply}
            disabled={applying}
            className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg hover:bg-brand-700 font-medium text-sm disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply to Brand Space'}
          </button>
          <button
            onClick={() => router.push(`/brands/${brandId}`)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Discard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-800 text-sm font-medium">
          {status === 'PENDING' ? 'Queued...' : 'Extracting brand identity...'}
        </p>
      </div>
      <p className="text-blue-600 text-xs mt-1">This usually takes 15–30 seconds.</p>
    </div>
  )
}
