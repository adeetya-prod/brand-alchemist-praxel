'use client'
type ColorKey = 'primaryColor' | 'secondaryColor' | 'accentColor'
type ColorField = { label: string; key: ColorKey; required?: boolean }
const FIELDS: ColorField[] = [
  { label: 'Primary Color', key: 'primaryColor', required: true },
  { label: 'Secondary Color', key: 'secondaryColor' },
  { label: 'Accent Color', key: 'accentColor' },
]
type Props = {
  values: { primaryColor: string; secondaryColor: string; accentColor: string }
  onChange: (v: Partial<{ primaryColor: string; secondaryColor: string; accentColor: string }>) => void
}
export default function Step2Colors({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Brand Colors</h3>
      {FIELDS.map(({ label, key, required }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
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
