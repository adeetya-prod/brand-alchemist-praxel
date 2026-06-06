'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBrandAction } from '@/app/actions/brand'
import type { Brand } from '@prisma/client'

const TONE_OPTIONS = ['professional', 'friendly', 'bold', 'playful', 'luxurious', 'minimalist', 'energetic', 'trustworthy', 'innovative', 'authentic']
const COLOR_FIELDS = [
  { label: 'Primary Color', key: 'primaryColor' as const },
  { label: 'Secondary Color', key: 'secondaryColor' as const },
  { label: 'Accent Color', key: 'accentColor' as const },
]

export default function BrandEditForm({ brand }: { brand: Brand }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: brand.name,
    tagline: brand.tagline || '',
    description: brand.description || '',
    primaryColor: brand.primaryColor || '',
    secondaryColor: brand.secondaryColor || '',
    accentColor: brand.accentColor || '',
    fontHeading: brand.fontHeading || '',
    fontBody: brand.fontBody || '',
    tone: brand.tone as string[],
    voiceGuide: brand.voiceGuide || '',
  })

  const update = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }))

  async function handleSave() {
    setSaving(true)
    setError(null)
    const result = await updateBrandAction(brand.id, form)
    if (result && 'error' in result) {
      setError('Validation failed — check your inputs.')
      setSaving(false)
      return
    }
    router.push(`/brands/${brand.id}`)
  }

  const CARD = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }
  const INPUT_S = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }
  const INPUT_C = 'w-full px-4 py-3 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm'
  const LABEL = 'block text-sm font-medium text-white/70 mb-1.5'

  return (
    <div className="max-w-xl space-y-5">
      <section className="rounded-2xl p-6 space-y-4" style={CARD}>
        <h3 className="font-semibold text-white">Identity</h3>
        <div>
          <label className={LABEL}>Brand Name <span className="text-[#FF6B6B]">*</span></label>
          <input value={form.name} onChange={e => update({ name: e.target.value })} className={INPUT_C} style={INPUT_S} />
        </div>
        <div>
          <label className={LABEL}>Tagline</label>
          <input value={form.tagline} onChange={e => update({ tagline: e.target.value })} className={INPUT_C} style={INPUT_S} />
        </div>
        <div>
          <label className={LABEL}>Description</label>
          <textarea value={form.description} onChange={e => update({ description: e.target.value })} rows={2} className={INPUT_C + ' resize-none'} style={INPUT_S} />
        </div>
      </section>

      <section className="rounded-2xl p-6 space-y-4" style={CARD}>
        <h3 className="font-semibold text-white">Colors</h3>
        {COLOR_FIELDS.map(({ label, key }) => (
          <div key={key}>
            <label className={LABEL}>{label}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form[key] || '#ffffff'} onChange={e => update({ [key]: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
              <input type="text" value={form[key]} onChange={e => update({ [key]: e.target.value })} placeholder="#7C3AED" maxLength={7} className="w-32 px-3 py-2 rounded-xl font-mono text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500" style={INPUT_S} />
              {form[key] && <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: form[key], border: '1px solid rgba(255,255,255,0.15)' }} />}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl p-6 space-y-4" style={CARD}>
        <h3 className="font-semibold text-white">Typography</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Heading Font</label>
            <input value={form.fontHeading} onChange={e => update({ fontHeading: e.target.value })} placeholder="Playfair Display" className={INPUT_C} style={INPUT_S} />
          </div>
          <div>
            <label className={LABEL}>Body Font</label>
            <input value={form.fontBody} onChange={e => update({ fontBody: e.target.value })} placeholder="Inter" className={INPUT_C} style={INPUT_S} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-6 space-y-4" style={CARD}>
        <h3 className="font-semibold text-white">Tone & Voice</h3>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(k => (
            <button key={k} type="button"
              onClick={() => update({ tone: form.tone.includes(k) ? form.tone.filter(t => t !== k) : form.tone.length < 5 ? [...form.tone, k] : form.tone })}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={form.tone.includes(k)
                ? { background: 'rgba(124,58,237,0.3)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.5)' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }
              }>
              {k}
            </button>
          ))}
        </div>
        <div>
          <label className={LABEL}>Voice Guide</label>
          <textarea value={form.voiceGuide} onChange={e => update({ voiceGuide: e.target.value })} rows={3} placeholder="Describe how your brand speaks..." className={INPUT_C + ' resize-none'} style={INPUT_S} />
        </div>
      </section>

      {error && <p className="text-sm text-[#FCA5A5]">{error}</p>}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving || !form.name.trim()}
          className="px-6 py-2.5 rounded-xl font-semibold text-white disabled:opacity-40 text-sm"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl text-white/60 hover:text-white text-sm transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}
