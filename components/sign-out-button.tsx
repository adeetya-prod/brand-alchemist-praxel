'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-white/50 hover:text-white/90 hover:bg-white/8 transition-colors px-3 py-1.5 rounded-lg"
    >
      Sign out
    </button>
  )
}
