'use client'
import { useState, useTransition, useCallback } from 'react'
import { refineBrandVoiceFromInputs } from '@/app/actions/ai-refine'

const TONE_OPTIONS = ['professional', 'friendly', 'bold', 'playful', 'luxurious', 'minimalist', 'energetic', 'trustworthy', 'innovative', 'authentic']

const TONE_EXAMPLES: Record<string, string> = {
  professional: '"Our team delivers measurable results, every time."',
  friendly: '"Hey there! We\'re so glad you stopped by."',
  bold: '"We don\'t follow trends. We set them."',
  playful: '"We turned your boring Monday into a design party 🎉"',
  luxurious: '"Experience the extraordinary, crafted just for you."',
  minimalist: '"Less clutter. More clarity."',
  energetic: '"Let\'s build something incredible — starting now."',
  trustworthy: '"Trusted by over 10,000 brands worldwide."',
  innovative: '"The future of creative is already here."',
  authentic: '"Real stories, real people, real impact."',
}

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
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-white mb-0.5">Tone & Voice</h3>
        <p className="text-sm text-white/40">Select up to 5 keywords that describe your brand's personality.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {TONE_OPTIONS.map(keyword => {
          const selected = values.tone.includes(keyword)
          return (
            <button key={keyword} type="button" onClick={() => toggleTone(keyword)}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
              style={selected
                ? { background: 'rgba(124,58,237,0.3)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.5)' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }
              }>
              {keyword}
            </button>
          )
        })}
      </div>
      {values.tone.length > 0 && (
        <div className="rounded-xl p-4 text-xs space-y-1.5" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          {values.tone.slice(0, 2).map(k => TONE_EXAMPLES[k] && (
            <p key={k} className="text-white/65"><span className="font-semibold capitalize text-brand-300">{k}:</span> {TONE_EXAMPLES[k]}</p>
          ))}
        </div>
      )}
      {values.tone.length >= 2 && (
        <button type="button" onClick={refineVoice} disabled={isPending}
          className="text-sm text-brand-400 hover:text-brand-300 font-medium disabled:opacity-50 transition-colors">
          {isPending ? '✨ Generating voice guide…' : '✨ Refine with AI'}
        </button>
      )}
      {values.voiceGuide && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm font-medium text-white/70 mb-1.5">Brand Voice Guide</p>
          <p className="text-sm text-white/60 leading-relaxed">{values.voiceGuide}</p>
        </div>
      )}
    </div>
  )
}
