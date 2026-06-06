'use client'
import { useState, useTransition, useCallback } from 'react'
import { refineBrandVoiceFromInputs } from '@/app/actions/ai-refine'

const TONE_OPTIONS = ['professional', 'friendly', 'bold', 'playful', 'luxurious', 'minimalist', 'energetic', 'trustworthy', 'innovative', 'authentic']

type Props = {
  values: { tone: string[]; voiceGuide: string; name: string; description: string; tagline: string }
  onChange: (v: any) => void
}

export default function Step4Tone({ values, onChange }: Props) {
  const [isPending, startTransition] = useTransition()

  const toggleTone = (keyword: string) => {
    const current = values.tone
    if (current.includes(keyword)) {
      onChange({ tone: current.filter(t => t !== keyword) })
    } else if (current.length < 5) {
      onChange({ tone: [...current, keyword] })
    }
  }

  const refineVoice = useCallback(() => {
    startTransition(async () => {
      const text = await refineBrandVoiceFromInputs({
        tone: values.tone,
        name: values.name,
        description: values.description,
        tagline: values.tagline,
      })
      onChange({ voiceGuide: text })
    })
  }, [values, onChange])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Tone & Voice</h3>
      <p className="text-sm text-gray-500">Select up to 5 keywords that describe your brand's personality.</p>
      <div className="flex flex-wrap gap-2">
        {TONE_OPTIONS.map(keyword => {
          const selected = values.tone.includes(keyword)
          return (
            <button key={keyword} type="button" onClick={() => toggleTone(keyword)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selected ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-700 hover:border-brand-400'}`}>
              {keyword}
            </button>
          )
        })}
      </div>
      {values.tone.length >= 2 && (
        <button type="button" onClick={refineVoice} disabled={isPending}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50">
          {isPending ? 'Generating voice guide...' : '✨ Refine with AI'}
        </button>
      )}
      {values.voiceGuide && (
        <div className="mt-3 p-4 bg-brand-50 rounded-lg border border-brand-100">
          <p className="text-sm font-medium text-brand-800 mb-1">Brand Voice Guide</p>
          <p className="text-sm text-gray-700">{values.voiceGuide}</p>
        </div>
      )}
    </div>
  )
}
