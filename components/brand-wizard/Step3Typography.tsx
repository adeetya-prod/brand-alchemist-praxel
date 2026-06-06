'use client'
type Props = { values: { fontHeading: string; fontBody: string }; onChange: (v: any) => void }
export default function Step3Typography({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Typography</h3>
      <p className="text-sm text-gray-500">Enter font family names as they appear in Google Fonts or CSS.</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
        <input value={values.fontHeading} onChange={e => onChange({ fontHeading: e.target.value })} placeholder="Playfair Display" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
        <input value={values.fontBody} onChange={e => onChange({ fontBody: e.target.value })} placeholder="Inter" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>
  )
}
