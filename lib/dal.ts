import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export const getCurrentUser = cache(async (): Promise<string> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
})
