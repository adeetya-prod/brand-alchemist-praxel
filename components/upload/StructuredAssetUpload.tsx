'use client'
import { useState } from 'react'
import { updateBrandAction } from '@/app/actions/brand'
import { useRouter } from 'next/navigation'

const TONE_OPTIONS = ['professional', 'friendly', 'bold', 'playful', 'luxurious', 'minimalist', 'energetic', 'trustworthy']

export default function StructuredAssetUpload({ brandId }: { brandId: string }) {
  const router = useRouter()
  const [colors, setColors] = useState(['', '', '', '', ''])
  const [fontHeading, setFontHeading] = useState('')
  const [fontBody, setFontBody] = useState('')
  const [tone, setTone] = useState<string[]>([])
  const [tagline, setTagline] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const [primary, secondary, accent] = colors.filter(Boolean)
    await updateBrandAction(brandId, {
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      fontHeading,
      fontBody,
      tone,
      tagline,
    })
    router.push(`/brands/${brandId}`)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Brand Colors (hex)</p>
        <div className="flex gap-2 flex-wrap">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="color"
                value={c || '#ffffff'}
                onChange={e => setColors(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={c}
                onChange={e => setColors(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                placeholder="#RRGGBB"
                maxLength={7}
                className="w-24 border border-gray-300 rounded px-2 py-1 text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Heading Font</label>
          <input
            value={fontHeading}
            onChange={e => setFontHeading(e.target.value)}
            placeholder="Playfair Display"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Body Font</label>
          <input
            value={fontBody}
            onChange={e => setFontBody(e.target.value)}
            placeholder="Inter"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Tagline</label>
        <input
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          placeholder="Your brand tagline"
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Tone Keywords</p>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setTone(t => t.includes(k) ? t.filter(x => x !== k) : t.length < 5 ? [...t, k] : t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tone.includes(k) ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-700 hover:border-brand-400'}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium"
      >
        {saving ? 'Saving...' : 'Save Brand Identity'}
      </button>
    </div>
  )
}
