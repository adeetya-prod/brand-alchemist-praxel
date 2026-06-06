import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
      {/* Gradient orb — CSS only, no image dependency */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle at center, #7C3AED 0%, #FF6B6B 55%, transparent 75%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
          <span className="text-white/80 text-xs font-medium">Built for creative brands</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
          Your brand.<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}>
            Every format.
          </span><br />
          Always on-brand.
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
          Import your brand guidelines, then generate on-brand social media creatives across every format in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            Start free
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto border border-white/20 text-white/80 hover:text-white hover:border-white/40 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            Sign in
          </Link>
        </div>

        <p className="text-white/30 text-xs mt-5">No credit card required</p>
      </div>
    </section>
  )
}
