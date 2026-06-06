import { getBrand } from '@/lib/db/brands'
import CreativeRequestForm from '@/components/creatives/CreativeRequestForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewCreativePage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  let brand
  try {
    brand = await getBrand(brandId)
  } catch {
    redirect('/brands')
  }
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/brands/${brandId}`} className="text-white/40 hover:text-white/70 text-sm transition-colors">
          {brand!.name}
        </Link>
        <span className="text-white/25">/</span>
        <span className="text-white/70 text-sm">Generate Creative</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-1">Generate Creative</h2>
      <p className="text-white/45 mb-8">Create on-brand visuals for {brand!.name}.</p>
      <CreativeRequestForm brandId={brandId} brandName={brand!.name} />
    </div>
  )
}
