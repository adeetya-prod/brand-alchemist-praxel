'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Step1Identity from '@/components/brand-wizard/Step1Identity'
import Step2Colors from '@/components/brand-wizard/Step2Colors'
import Step3Typography from '@/components/brand-wizard/Step3Typography'
import Step4Tone from '@/components/brand-wizard/Step4Tone'
import Step5Submit from '@/components/brand-wizard/Step5Submit'
import { createBrand } from '@/app/actions/brand'

type WizardState = {
  name: string
  description: string
  tagline: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  tone: string[]
  voiceGuide: string
}

const STEPS = ['Identity', 'Colors', 'Typography', 'Tone & Voice', 'Review']

export default function WizardShell() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<WizardState>({
    name: '', description: '', tagline: '',
    primaryColor: '#6366f1', secondaryColor: '', accentColor: '',
    fontHeading: '', fontBody: '', tone: [], voiceGuide: '',
  })

  const update = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))

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
      if ('error' in result) {
        setError(JSON.stringify(result.error))
        setSubmitting(false)
        return
      }
      router.push(`/brands/${result.brandId}`)
    } catch (e) {
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

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Brand</h2>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-8 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {stepComponents[step]}
      </div>

      <div className="flex justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Back
          </button>
        ) : <div />}
        {step < STEPS.length - 1 && (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 0 && !state.name.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
