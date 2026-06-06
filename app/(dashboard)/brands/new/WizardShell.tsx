'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Step1Identity from '@/components/brand-wizard/Step1Identity'
import Step2Colors from '@/components/brand-wizard/Step2Colors'
import Step3Typography from '@/components/brand-wizard/Step3Typography'
import Step4Tone from '@/components/brand-wizard/Step4Tone'
import Step5Submit from '@/components/brand-wizard/Step5Submit'
import { createBrand } from '@/app/actions/brand'

type Method = 'pdf' | 'website' | 'manual' | null

type WizardState = {
  name: string; description: string; tagline: string
  primaryColor: string; secondaryColor: string; accentColor: string
  fontHeading: string; fontBody: string; tone: string[]; voiceGuide: string
}

const STEPS = ['Identity', 'Colors', 'Typography', 'Tone & Voice', 'Review']

const METHODS = [
  {
    id: 'pdf' as Method,
    icon: '📄',
    title: 'Upload PDF Guidelines',
    desc: 'Import your existing brand book, style guide, or PDF deck',
    gradient: 'from-violet-600/20 to-purple-900/20',
    border: 'rgba(124,58,237,0.3)',
  },
  {
    id: 'website' as Method,
    icon: '🌐',
    title: 'Import from Website',
    desc: 'Extract brand colors, fonts, and tone directly from your site',
    gradient: 'from-blue-600/20 to-indigo-900/20',
    border: 'rgba(99,102,241,0.3)',
  },
  {
    id: 'manual' as Method,
    icon: '✏️',
    title: 'Set Up Manually',
    desc: 'Build your brand identity step-by-step with guided prompts',
    gradient: 'from-rose-600/20 to-pink-900/20',
    border: 'rgba(255,107,107,0.3)',
  },
]

export default function WizardShell() {
  const router = useRouter()
  const [method, setMethod] = useState<Method>(null)
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [quickName, setQuickName] = useState('')
  const [quickError, setQuickError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<WizardState>({
    name: '', description: '', tagline: '',
    primaryColor: '#7C3AED', secondaryColor: '', accentColor: '',
    fontHeading: '', fontBody: '', tone: [], voiceGuide: '',
  })

  const update = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))

  async function handleQuickCreate(tab: number) {
    if (!quickName.trim()) { setQuickError('Brand name is required'); return }
    setSubmitting(true)
    setQuickError(null)
    const fd = new FormData()
    fd.append('name', quickName.trim())
    const result = await createBrand(fd)
    setSubmitting(false)
    if ('error' in result) { setQuickError('Failed to create brand. Try again.'); return }
    router.push(`/brands/new/upload?brandId=${result.brandId}&tab=${tab}`)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const fd = new FormData()
      Object.entries(state).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => fd.append(k, item))
        else if (v) fd.append(k, v)
      })
      const result = await createBrand(fd)
      if ('error' in result) { setError(JSON.stringify(result.error)); setSubmitting(false); return }
      router.push(`/brands/${result.brandId}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const stepComponents = [
    <Step1Identity key="1" values={state} onChange={update} />,
    <Step2Colors key="2" values={state} onChange={update} />,
    <Step3Typography key="3" values={state} onChange={update} />,
    <Step4Tone key="4" values={state} onChange={update} />,
    <Step5Submit key="5" values={state} onSubmit={handleSubmit} submitting={submitting} error={error} />,
  ]

  // Method chooser screen
  if (!method) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Create a Brand Space</h1>
          <p className="text-white/50">How would you like to set up your brand identity?</p>
        </div>
        <div className="space-y-3">
          {METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className="w-full text-left p-5 rounded-2xl transition-all group"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${m.border}` }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {m.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-base">{m.title}</p>
                  <p className="text-sm text-white/50 mt-0.5">{m.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Quick create form for PDF / Website
  if (method === 'pdf' || method === 'website') {
    const tab = method === 'pdf' ? 0 : 1
    const label = method === 'pdf' ? 'PDF Guidelines' : 'Website URL'
    return (
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => setMethod(null)}
          className="flex items-center gap-2 text-sm text-white/45 hover:text-white/80 mb-8 transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-white mb-1">Import from {label}</h2>
        <p className="text-white/50 mb-8">First, give your brand a name so we can create a space for it.</p>
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <label className="block text-sm font-medium text-white/70 mb-2">Brand Name</label>
          <input
            value={quickName}
            onChange={e => setQuickName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuickCreate(tab)}
            placeholder="Acme Co."
            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
          {quickError && <p className="text-red-400 text-sm mb-4">{quickError}</p>}
          <button
            onClick={() => handleQuickCreate(tab)}
            disabled={submitting || !quickName.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
          >
            {submitting ? 'Creating…' : 'Continue to Import →'}
          </button>
        </div>
      </div>
    )
  }

  // Manual wizard
  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => setMethod(null)}
        className="flex items-center gap-2 text-sm text-white/45 hover:text-white/80 mb-8 transition-colors"
      >
        ← Back
      </button>
      {/* Step indicators */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-5">Set Up Your Brand</h2>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? 'bg-brand-600 text-white'
                    : i === step
                    ? 'text-white'
                    : 'text-white/30'
                }`}
                style={i === step ? { background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' } : i < step ? {} : { background: 'rgba(255,255,255,0.08)' }}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-px w-8" style={{ background: i < step ? '#7C3AED' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-white/40 mt-2">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      </div>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        {stepComponents[step]}
      </div>

      <div className="flex justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            className="px-5 py-2.5 rounded-xl text-white/70 hover:text-white transition-colors text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            ← Back
          </button>
        ) : <div />}
        {step < STEPS.length - 1 && (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 0 && !state.name.trim()}
            className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
