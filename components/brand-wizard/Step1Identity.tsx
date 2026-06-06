'use client'
type Props = { values: { name: string; description: string; tagline: string }; onChange: (v: any) => void }
export default function Step1Identity({ values, onChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Brand Identity</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name <span className="text-red-500">*</span></label>
        <input value={values.name} onChange={e => onChange({ name: e.target.value })} placeholder="Acme Co." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input value={values.tagline} onChange={e => onChange({ tagline: e.target.value })} placeholder="Just do it." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={values.description} onChange={e => onChange({ description: e.target.value })} rows={3} placeholder="What does your brand do and who does it serve?" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>
  )
}
