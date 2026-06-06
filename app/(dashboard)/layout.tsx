import { getCurrentUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/sign-out-button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await getCurrentUser()
  } catch {
    redirect('/sign-in')
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/brands" className="text-xl font-bold text-brand-600 hover:text-brand-700">Brand Alchemist</a>
          <div className="flex items-center gap-6">
            <a href="/brands" className="text-sm font-medium text-gray-600 hover:text-gray-900">Brands</a>
          </div>
        </div>
        <SignOutButton />
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
