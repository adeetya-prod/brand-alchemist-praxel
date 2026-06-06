'use client'
const S = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }
const I = 'w-full px-4 py-3 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm'
const L = 'block text-sm font-medium text-white/70 mb-1.5'
type Props = { values: { name: string; description: string; tagline: string }; onChange: (v: any) => void }
export default function Step1Identity({ values, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-white mb-0.5">Brand Identity</h3>
        <p className="text-sm text-white/40">The foundation of everything your brand creates.</p>
      </div>
      <div>
        <label className={L}>Brand Name <span className="text-[#FF6B6B]">*</span></label>
        <input value={values.name} onChange={e => onChange({ name: e.target.value })} placeholder="Acme Co." className={I} style={S} />
      </div>
      <div>
        <label className={L}>Tagline</label>
        <input value={values.tagline} onChange={e => onChange({ tagline: e.target.value })} placeholder="Just do it." className={I} style={S} />
      </div>
      <div>
        <label className={L}>Description</label>
        <textarea value={values.description} onChange={e => onChange({ description: e.target.value })} rows={3} placeholder="What does your brand do and who does it serve?" className={I + ' resize-none'} style={S} />
      </div>
    </div>
  )
}
