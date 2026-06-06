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
        <h3 className="font-semibold text-white mb-0.5">Typography</h3>
        <p className="text-sm text-white/40">Enter font names as they appear in Google Fonts or CSS.</p>
      </div>

      <div>
        <p className="text-xs font-medium text-white/45 mb-2">Quick pairings — click to use</p>
        <div className="grid grid-cols-3 gap-3">
          {PAIRINGS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => onChange({ fontHeading: p.heading, fontBody: p.body })}
              className="rounded-xl p-3 text-left transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-xs text-brand-400 font-semibold mb-1.5">{p.name}</p>
              <p style={{ ...p.headingStyle, fontSize: 15, color: '#F0F0F8' }} className="mb-0.5 truncate">Aa</p>
              <p style={{ ...p.bodyStyle, fontSize: 11, color: 'rgba(255,255,255,0.45)' }} className="truncate">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Heading Font</label>
        <input
          value={values.fontHeading}
          onChange={e => onChange({ fontHeading: e.target.value })}
          placeholder="Playfair Display"
          className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Body Font</label>
        <input
          value={values.fontBody}
          onChange={e => onChange({ fontBody: e.target.value })}
          placeholder="Inter"
          className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
      </div>
    </div>
  )
}
