'use client'
type WizardState = { name: string; description: string; tagline: string; primaryColor: string; secondaryColor: string; accentColor: string; fontHeading: string; fontBody: string; tone: string[]; voiceGuide: string }
type Props = { values: WizardState; onSubmit: () => void; submitting: boolean; error: string | null }

export default function Step5Submit({ values, onSubmit, submitting, error }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Review & Create</h3>
      <div className="space-y-3 text-sm">
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
        {values.voiceGuide && <div><span className="text-gray-500">Voice Guide:</span> <span className="italic">{values.voiceGuide.slice(0, 100)}...</span></div>}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">You can upload your logo and add more details after creating your brand.</p>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !values.name.trim()}
        className="w-full bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Creating...' : 'Create Brand'}
      </button>
    </div>
  )
}
