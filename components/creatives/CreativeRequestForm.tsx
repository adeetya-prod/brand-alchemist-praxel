'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestBatchCreativeGeneration } from '@/app/actions/creatives'

type Format = 'INSTAGRAM_SQUARE' | 'INSTAGRAM_STORY' | 'LINKEDIN_POST' | 'LINKEDIN_BANNER'

const FORMATS: { value: Format; label: string; desc: string; aspect: string; icon: string }[] = [
  { value: 'INSTAGRAM_SQUARE', label: 'Instagram Square', desc: 'Feed post', aspect: '1:1', icon: '📸' },
  { value: 'INSTAGRAM_STORY', label: 'Instagram Story', desc: 'Full-screen vertical', aspect: '9:16', icon: '📱' },
  { value: 'LINKEDIN_POST', label: 'LinkedIn Post', desc: 'Feed image', aspect: '1.91:1', icon: '💼' },
  { value: 'LINKEDIN_BANNER', label: 'LinkedIn Banner', desc: 'Profile banner', aspect: '4:1', icon: '🏷' },
]

const CTA_OPTIONS = ['Learn More', 'Shop Now', 'Sign Up', 'Book a Demo', 'Get Started', 'Download Now', 'Contact Us']
const TONE_OPTIONS = ['Professional', 'Playful', 'Bold', 'Minimal', 'Urgent', 'Inspirational']
const INTENT_OPTIONS = ['Brand Awareness', 'Drive Sales', 'Event Promotion', 'Lead Generation', 'Customer Retention', 'Product Launch']

const CARD = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }
const PILL_DEFAULT = { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }
const PILL_ACTIVE = { background: 'rgba(124,58,237,0.22)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.45)' }

function PillGroup({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="rounded-2xl p-5" style={CARD}>
      <p className="text-sm font-semibold text-white mb-1">
        {label}
        {required && <span className="ml-1 text-[#FF6B6B]">*</span>}
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={value === opt ? PILL_ACTIVE : PILL_DEFAULT}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CreativeRequestForm({ brandId, brandName }: { brandId: string; brandName: string }) {
  const router = useRouter()
  const [selectedFormats, setSelectedFormats] = useState<Format[]>(['INSTAGRAM_SQUARE'])
  const [ctaLabel, setCtaLabel] = useState('')
  const [tone, setTone] = useState('')
  const [intent, setIntent] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleFormat(format: Format) {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    )
  }

  const totalCreatives = selectedFormats.length * 2
  const canSubmit = selectedFormats.length > 0 && ctaLabel && tone && intent

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) { setError('Select at least one format and fill in all required fields.'); return }
    setError(null)
    setSubmitting(true)
    try {
      const result = await requestBatchCreativeGeneration({
        brandId,
        formats: selectedFormats,
        ctaLabel,
        tone,
        intent,
        additionalContext: additionalContext || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Format selector */}
      <div className="rounded-2xl p-5" style={CARD}>
        <p className="text-sm font-semibold text-white mb-1">Select Formats</p>
        <p className="text-xs text-white/40 mb-4">Each format generates 2 variants — so you always have options.</p>
        <div className="grid grid-cols-2 gap-3">
          {FORMATS.map(f => {
            const checked = selectedFormats.includes(f.value)
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleFormat(f.value)}
                className="p-4 rounded-xl text-left transition-all relative"
                style={checked
                  ? { background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.45)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }
                }
              >
                {checked && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="text-xl mb-2">{f.icon}</div>
                <p className={`font-medium text-sm ${checked ? 'text-brand-300' : 'text-white'}`}>{f.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{f.desc} · {f.aspect}</p>
              </button>
            )
          })}
        </div>
        {selectedFormats.length === 0 && (
          <p className="text-xs text-[#FF6B6B] mt-2">Select at least one format.</p>
        )}
      </div>

      {/* CTA, Tone, Intent pill selectors */}
      <PillGroup label="CTA Button" options={CTA_OPTIONS} value={ctaLabel} onChange={setCtaLabel} required />
      <PillGroup label="Creative Tone" options={TONE_OPTIONS} value={tone} onChange={setTone} required />
      <PillGroup label="Campaign Goal" options={INTENT_OPTIONS} value={intent} onChange={setIntent} required />

      {/* Additional context */}
      <div className="rounded-2xl p-5" style={CARD}>
        <label className="block text-sm font-semibold text-white mb-1">
          Additional Context <span className="text-white/35 font-normal">(optional)</span>
        </label>
        <p className="text-xs text-white/40 mb-3">Any extra details, campaign specifics, or creative direction.</p>
        <textarea
          value={additionalContext}
          onChange={e => setAdditionalContext(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="e.g. Summer sale — 30% off. Focus on outdoor lifestyle imagery."
          className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <p className="text-xs text-white/30 mt-1.5 text-right">{additionalContext.length}/300</p>
      </div>

      {error && <p className="text-sm text-[#FF6B6B]">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !canSubmit}
        className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-40 transition-opacity text-sm"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
      >
        {submitting
          ? 'Queuing generation…'
          : totalCreatives > 0
            ? `✨ Generate ${totalCreatives} creative${totalCreatives !== 1 ? 's' : ''}`
            : 'Select a format'}
      </button>
      {totalCreatives > 0 && (
        <p className="text-xs text-white/30 text-center">
          {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''} × 2 variants = {totalCreatives} images · ~30s each
        </p>
      )}
    </form>
  )
}
