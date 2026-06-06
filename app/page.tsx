import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import FeatureBento from '@/components/landing/FeatureBento'
import SocialProofStrip from '@/components/landing/SocialProofStrip'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D0117', color: '#ffffff' }}>
      <LandingNav />
      <HeroSection />
      <FeatureBento />
      <SocialProofStrip />

      {/* CTA footer section */}
      <section className="py-24 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to alchemize your brand?
        </h2>
        <p className="text-white/50 mb-8 max-w-sm mx-auto">
          Start for free. No credit card required.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-10 py-3.5 rounded-xl font-semibold text-base transition-colors"
        >
          Get started free
        </Link>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="text-white/20 text-xs">© 2026 Brand Alchemist. All rights reserved.</p>
      </footer>
    </div>
  )
}
