'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { DARK_INPUT_CLASS, DARK_INPUT_STYLE, DARK_LABEL_CLASS } from '@/lib/styles'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setVerifying(true)
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0a0a14' }}>
        <div className="w-full max-w-sm rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
          <div className="text-3xl mb-3">📬</div>
          <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            We sent a confirmation link to <span className="text-white font-medium">{email}</span>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#0a0a14' }}>
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold tracking-tight" style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Brand Alchemist
        </span>
      </div>

      <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Start building your brand identity</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={DARK_LABEL_CLASS}>Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={DARK_INPUT_CLASS}
              style={DARK_INPUT_STYLE}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={DARK_LABEL_CLASS}>Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={DARK_INPUT_CLASS}
              style={DARK_INPUT_STYLE}
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.25)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-sm text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium" style={{ color: '#C4B5FD' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
