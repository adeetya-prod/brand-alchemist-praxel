'use client'

const PAIRINGS = [
  {
    name: 'Editorial',
    heading: 'Playfair Display',
    body: 'Inter',
    desc: 'Classic and authoritative',
    headingStyle: { fontFamily: 'Georgia, serif', fontWeight: 700 },
    bodyStyle: { fontFamily: 'system-ui, sans-serif', fontWeight: 400 },
  },
  {
    name: 'Modern',
    heading: 'DM Sans',
    body: 'DM Sans',
    desc: 'Clean and confident',
    headingStyle: { fontFamily: 'system-ui, sans-serif', fontWeight: 700 },
    bodyStyle: { fontFamily: 'system-ui, sans-serif', fontWeight: 400 },
  },
  {
    name: 'Friendly',
    heading: 'Nunito',
    body: 'Open Sans',
    desc: 'Warm and approachable',
    headingStyle: { fontFamily: 'system-ui, sans-serif', fontWeight: 800 },
    bodyStyle: { fontFamily: 'system-ui, sans-serif', fontWeight: 400, letterSpacing: '0.01em' },
  },
]

type Props = { values: { fontHeading: string; fontBody: string }; onChange: (v: { fontHeading?: string; fontBody?: string }) => void }

export default function Step3Typography({ values, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Typography</h3>
        <p className="text-sm text-gray-500">Enter font family names as they appear in Google Fonts or CSS.</p>
      </div>

      {/* Pairing examples */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Quick pairings — click to use</p>
        <div className="grid grid-cols-3 gap-3">
          {PAIRINGS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => onChange({ fontHeading: p.heading, fontBody: p.body })}
              className="border border-gray-200 rounded-lg p-3 text-left hover:border-brand-400 transition-colors"
            >
              <p className="text-xs text-brand-600 font-semibold mb-1">{p.name}</p>
              <p style={{ ...p.headingStyle, fontSize: 14 }} className="text-gray-900 mb-0.5 truncate">Aa</p>
              <p style={{ ...p.bodyStyle, fontSize: 11 }} className="text-gray-500 truncate">{p.desc}</p>
              <p className="text-xs text-gray-400 mt-1 truncate">{p.heading} / {p.body}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
        <input
          value={values.fontHeading}
          onChange={e => onChange({ fontHeading: e.target.value })}
          placeholder="Playfair Display"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
        <input
          value={values.fontBody}
          onChange={e => onChange({ fontBody: e.target.value })}
          placeholder="Inter"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    </div>
  )
}
