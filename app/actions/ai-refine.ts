'use server'
import { generateText } from 'ai'
import { openai as aiSdkOpenai } from '@ai-sdk/openai'
import { getCurrentUser } from '@/lib/dal'
import { updateBrand } from '@/lib/db/brands'

type BrandInputs = {
  tone: string[]
  name: string
  description?: string
  tagline?: string
}

export async function refineBrandVoiceFromInputs(inputs: BrandInputs): Promise<string> {
  await getCurrentUser()
  const { text } = await generateText({
    model: aiSdkOpenai('gpt-4o'),
    prompt: `You are a brand strategist. Write a concise 2-3 sentence brand voice guide for a content creator writing social media captions and posts for this brand:\n\nBrand name: ${inputs.name}\nTone keywords: ${inputs.tone.join(', ')}\nDescription: ${inputs.description || 'N/A'}\nTagline: ${inputs.tagline || 'N/A'}\n\nWrite the voice guide in second person addressing the content creator. Be specific and actionable.`,
  })
  return text
}

export async function saveBrandVoice(brandId: string, voiceGuide: string) {
  await getCurrentUser()
  const brand = await updateBrand(brandId, { voiceGuide })
  return { brand }
}
