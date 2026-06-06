'use client'

type ColorKey = 'primaryColor' | 'secondaryColor' | 'accentColor'
type ColorField = { label: string; key: ColorKey; required?: boolean; hint: string }

const FIELDS: ColorField[] = [
  { label: 'Primary Color', key: 'primaryColor', required: true, hint: 'Your most recognizable color — appears on buttons and headlines.' },
  { label: 'Secondary Color', key: 'secondaryColor', hint: 'Complements the primary — used for backgrounds and accents.' },
  { label: 'Accent Color', key: 'accentColor', hint: 'High-energy pop for CTAs and highlights.' },
]

const PRESETS = [
  { name: 'Bold Studio', colors: ['#7C3AED', '#1E1B4B', '#FF6B6B'] },
  { name: 'Earth Creative', colors: ['#92400E', '#D97706', '#FEF3C7'] },
  { name: 'Tech Minimal', colors: ['#0F172A', '#3B82F6', '#F8FAFC'] },
  { name: 'Neon Pop', colors: ['#EC4899', '#8B5CF6', '#06B6D4'] },
  { name: 'Warm Editorial', colors: ['#9F1239', '#F97316', '#FFFBEB'] },
  { name: 'Mono Edge', colors: ['#111827', '#6B7280', '#F9FAFB'] },
]

type Props = {
  values: { primaryColor: string; secondaryColor: string; accentColor: string }
  onChange: (v: Partial<{ primaryColor: string; secondaryColor: string; accentColor: string }>) => void
}

export default function Step2Colors({ values, onChange }: Props) {
  function applyPreset(colors: string[]) {
    onChange({ primaryColor: colors[0], secondaryColor: colors[1], accentColor: colors[2] })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Brand Colors</h3>
        <p className="text-xs text-gray-400">Tip: Your primary color should be the most recognizable — it appears on buttons and headlines.</p>
      </div>

      {/* Preset palette strips */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p.colors)}
              title={p.name}
              className="flex items-center gap-0.5 p-1 rounded-lg border border-gray-200 hover:border-brand-400 transition-colors"
            >
              {p.colors.map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-sm" style={{ backgroundColor: c }} />
              ))}
              <span className="text-xs text-gray-500 ml-1.5 pr-1">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color pickers */}
      {FIELDS.map(({ label, key, required, hint }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <p className="text-xs text-gray-400 mb-1.5">{hint}</p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={values[key] || '#ffffff'}
              onChange={e => onChange({ [key]: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <input
              type="text"
              value={values[key] || ''}
              onChange={e => onChange({ [key]: e.target.value })}
              placeholder="#6366f1"
              maxLength={7}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {values[key] && (
              <div className="w-8 h-8 rounded border border-gray-200" style={{ backgroundColor: values[key] }} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
