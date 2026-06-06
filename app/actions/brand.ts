'use server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

const BrandSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  tagline: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal('')),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
  tone: z.array(z.string()).max(5).optional(),
  voiceGuide: z.string().optional(),
})

export async function createBrand(formData: FormData) {
  const userId = await getCurrentUser()
  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || undefined,
    tagline: formData.get('tagline') as string || undefined,
    primaryColor: formData.get('primaryColor') as string || undefined,
    secondaryColor: formData.get('secondaryColor') as string || undefined,
    accentColor: formData.get('accentColor') as string || undefined,
    fontHeading: formData.get('fontHeading') as string || undefined,
    fontBody: formData.get('fontBody') as string || undefined,
    tone: formData.getAll('tone') as string[],
    voiceGuide: formData.get('voiceGuide') as string || undefined,
  }
  const parsed = BrandSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten() }
  const brand = await prisma.brand.create({
    data: { ...parsed.data, userId, tone: parsed.data.tone || [] },
  })
  revalidatePath('/dashboard')
  return { brandId: brand.id }
}

const UpdateBrandSchema = BrandSchema.extend({ name: z.string().min(1).max(100).optional() })

export async function updateBrandAction(brandId: string, data: z.infer<typeof UpdateBrandSchema>) {
  const parsed = UpdateBrandSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }
  const { updateBrand } = await import('@/lib/db/brands')
  const brand = await updateBrand(brandId, { ...parsed.data, tone: parsed.data.tone || [] })
  revalidatePath(`/brands/${brandId}`)
  return { brand }
}
