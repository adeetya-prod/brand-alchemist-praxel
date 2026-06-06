'use client'
import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    title: 'Brand DNA',
    desc: 'Colors, fonts, and tone — captured once, applied everywhere.',
    gradient: 'from-[#7C3AED] to-[#a855f7]',
    span: 'md:col-span-2',
  },
  {
    title: 'Three ways in',
    desc: 'Upload a PDF, paste a URL, or build manually step by step.',
    gradient: 'from-[#5b21b6] to-[#7C3AED]',
    span: '',
  },
  {
    title: 'Generate in seconds',
    desc: 'Multi-format output — Instagram, LinkedIn, and more — in one click.',
    gradient: 'from-[#FF6B6B] to-[#ff9a9a]',
    span: '',
  },
  {
    title: 'Every format covered',
    desc: 'Square, story, post, banner — 2 variants per format so you always have a choice.',
    gradient: 'from-[#e040fb] to-[#FF6B6B]',
    span: 'md:col-span-2',
  },
]

function BentoCard({ title, desc, gradient, span }: typeof FEATURES[number]) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${span} rounded-2xl border border-white/10 p-6 flex flex-col justify-between min-h-[180px] transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      style={{ background: '#1A0030' }}
    >
      {/* Gradient strip accent */}
      <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${gradient} mb-4`} />
      <div>
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function FeatureBento() {
  return (
    <section className="px-6 py-24 max-w-4xl mx-auto">
      <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
      <h2 className="text-center text-white text-3xl md:text-4xl font-bold mb-12">
        Brand-first, format-perfect
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map(f => <BentoCard key={f.title} {...f} />)}
      </div>
    </section>
  )
}
