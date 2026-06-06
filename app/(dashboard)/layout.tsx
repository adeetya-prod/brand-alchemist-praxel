import { getCurrentUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { BRAND_SPACES } from '@/lib/copy'
import SignOutButton from '@/components/sign-out-button'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await getCurrentUser()
  } catch {
    redirect('/sign-in')
  }
  return (
    <div className="min-h-screen" style={{ background: '#0A0118' }}>
      <nav
        className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between"
        style={{ background: 'rgba(10,1,24,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-8">
          <Link href="/brands" className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-label="Brand Alchemist logo">
              <defs>
                <linearGradient id="nav-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#FF6B6B" />
                </linearGradient>
                <clipPath id="nav-clip">
                  <rect x="12" y="2" width="16" height="4" rx="2" />
                  <rect x="16" y="6" width="8" height="8" />
                  <circle cx="20" cy="28" r="11" />
                </clipPath>
              </defs>
              <rect x="0" y="0" width="40" height="40" fill="url(#nav-g)" clipPath="url(#nav-clip)" />
            </svg>
            <span className="text-[17px] font-bold text-white tracking-tight">Brand Alchemist</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/brands" className="text-sm text-white/55 hover:text-white transition-colors">{BRAND_SPACES}</Link>
          </div>
        </div>
        <SignOutButton />
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
