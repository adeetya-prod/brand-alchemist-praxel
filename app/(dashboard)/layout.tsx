import { getCurrentUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await getCurrentUser()
  } catch {
    redirect('/sign-in')
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <a href="/brands" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">Brand Alchemist</a>
        <UserButton />
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
