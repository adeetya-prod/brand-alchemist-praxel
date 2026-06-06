'use client'
import { BRAND_SPACE } from '@/lib/copy'

type WizardState = {
  name: string; description: string; tagline: string
  primaryColor: string; secondaryColor: string; accentColor: string
  fontHeading: string; fontBody: string; tone: string[]; voiceGuide: string
}
type Props = { values: WizardState; onSubmit: () => void; submitting: boolean; error: string | null }

export default function Step5Submit({ values, onSubmit, submitting, error }: Props) {
  const primary = values.primaryColor || '#7C3AED'
  const secondary = values.secondaryColor || '#FF6B6B'

  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-gray-800">Review & Create</h3>

      {/* Live preview card */}
      <div
        className="rounded-xl overflow-hidden shadow-md"
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        <div className="px-6 py-8 text-center">
          <p
            className="text-white text-xl font-bold mb-1 truncate"
            style={{ fontFamily: values.fontHeading ? `${values.fontHeading}, sans-serif` : undefined }}
          >
            {values.name || 'Your Brand Name'}
          </p>
          {values.tagline && (
            <p
              className="text-white/75 text-sm truncate"
              style={{ fontFamily: values.fontBody ? `${values.fontBody}, sans-serif` : undefined }}
            >
              {values.tagline}
            </p>
          )}
          {values.tone.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              {values.tone.slice(0, 3).map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-black/20 px-6 py-2 text-center">
          <p className="text-white/50 text-xs">Preview — not the generated creative</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div><span className="text-gray-500">Name:</span> <span className="font-medium">{values.name}</span></div>
        {values.tagline && <div><span className="text-gray-500">Tagline:</span> {values.tagline}</div>}
        {values.primaryColor && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Colors:</span>
            {[values.primaryColor, values.secondaryColor, values.accentColor].filter(Boolean).map((c, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}
        {values.tone.length > 0 && <div><span className="text-gray-500">Tone:</span> {values.tone.join(', ')}</div>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">You can upload your logo and add more details after creating your {BRAND_SPACE.toLowerCase()}.</p>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !values.name.trim()}
        className="w-full bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Creating...' : `Create ${BRAND_SPACE}`}
      </button>
    </div>
  )
}
