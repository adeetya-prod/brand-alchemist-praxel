'use client'
import { useState } from 'react'
import { updateBrandAction } from '@/app/actions/brand'
import { useRouter } from 'next/navigation'
import { DARK_INPUT_CLASS, DARK_INPUT_STYLE, DARK_LABEL_CLASS } from '@/lib/styles'

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
        <p className={`${DARK_LABEL_CLASS} mb-2`}>Brand Colors (hex)</p>
        <div className="flex gap-2 flex-wrap">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="color"
                value={c || '#7C3AED'}
                onChange={e => setColors(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                className="w-8 h-8 rounded cursor-pointer flex-shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
              />
              <input
                type="text"
                value={c}
                onChange={e => setColors(prev => { const n = [...prev]; n[i] = e.target.value; return n })}
                placeholder="#RRGGBB"
                maxLength={7}
                className="w-24 px-2 py-1 rounded text-xs font-mono text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={DARK_LABEL_CLASS}>Heading Font</label>
          <input
            value={fontHeading}
            onChange={e => setFontHeading(e.target.value)}
            placeholder="Playfair Display"
            className={DARK_INPUT_CLASS}
            style={DARK_INPUT_STYLE}
          />
        </div>
        <div>
          <label className={DARK_LABEL_CLASS}>Body Font</label>
          <input
            value={fontBody}
            onChange={e => setFontBody(e.target.value)}
            placeholder="Inter"
            className={DARK_INPUT_CLASS}
            style={DARK_INPUT_STYLE}
          />
        </div>
      </div>

      <div>
        <label className={DARK_LABEL_CLASS}>Tagline</label>
        <input
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          placeholder="Your brand tagline"
          className={DARK_INPUT_CLASS}
          style={DARK_INPUT_STYLE}
        />
      </div>

      <div>
        <p className={`${DARK_LABEL_CLASS} mb-2`}>Tone Keywords</p>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(k => (
            <button
              key={k}
              type="button"
              onClick={() => setTone(t => t.includes(k) ? t.filter(x => x !== k) : t.length < 5 ? [...t, k] : t)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={tone.includes(k)
                ? { background: 'rgba(124,58,237,0.25)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.5)' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.12)' }
              }
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 transition-opacity text-sm"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
      >
        {saving ? 'Saving...' : 'Save Brand Identity'}
      </button>
    </div>
  )
}
