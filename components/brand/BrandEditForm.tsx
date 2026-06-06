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

  return (
    <div className="max-w-xl space-y-6">
      {/* Identity */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Identity</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name <span className="text-red-500">*</span></label>
          <input value={form.name} onChange={e => update({ name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
          <input value={form.tagline} onChange={e => update({ tagline: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => update({ description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </section>

      {/* Colors */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Colors</h3>
        {COLOR_FIELDS.map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form[key] || '#ffffff'} onChange={e => update({ [key]: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
              <input type="text" value={form[key]} onChange={e => update({ [key]: e.target.value })} placeholder="#6366f1" maxLength={7} className="w-32 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {form[key] && <div className="w-8 h-8 rounded border border-gray-200" style={{ backgroundColor: form[key] }} />}
            </div>
          </div>
        ))}
      </section>

      {/* Typography */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Typography</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
            <input value={form.fontHeading} onChange={e => update({ fontHeading: e.target.value })} placeholder="Playfair Display" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
            <input value={form.fontBody} onChange={e => update({ fontBody: e.target.value })} placeholder="Inter" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </section>

      {/* Tone */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Tone & Voice</h3>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map(k => (
            <button key={k} type="button"
              onClick={() => update({ tone: form.tone.includes(k) ? form.tone.filter(t => t !== k) : form.tone.length < 5 ? [...form.tone, k] : form.tone })}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.tone.includes(k) ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 hover:border-indigo-400'}`}>
              {k}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Voice Guide</label>
          <textarea value={form.voiceGuide} onChange={e => update({ voiceGuide: e.target.value })} rows={3} placeholder="Describe how your brand speaks..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving || !form.name.trim()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => router.back()} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  )
}
