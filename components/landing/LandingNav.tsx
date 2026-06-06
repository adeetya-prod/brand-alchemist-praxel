import Link from 'next/link'

export default function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#0D0117]/80 border-b border-white/10">
      <div className="flex items-center gap-2">
        {/* Flask mark SVG */}
        <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="nav-brand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7C3AED"/>
              <stop offset="100%" stopColor="#FF6B6B"/>
            </linearGradient>
            <clipPath id="nav-flask">
              <rect x="14" y="6" width="12" height="3" rx="1.5"/>
              <rect x="17" y="9" width="6" height="9"/>
              <circle cx="20" cy="27" r="11"/>
            </clipPath>
          </defs>
          <rect width="40" height="40" fill="url(#nav-brand)" clipPath="url(#nav-flask)"/>
        </svg>
        <span className="text-white font-semibold text-lg tracking-tight">Brand Alchemist</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className="text-sm text-white/70 hover:text-white font-medium transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="text-sm bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Get started free
        </Link>
      </div>
    </nav>
  )
}
