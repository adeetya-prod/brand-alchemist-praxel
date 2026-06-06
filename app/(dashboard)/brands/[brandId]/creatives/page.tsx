import { getCreatives } from '@/lib/db/creatives'
import { getBrand } from '@/lib/db/brands'
import Link from 'next/link'
import CreativesGrid from '@/components/creatives/CreativesGrid'
import { redirect } from 'next/navigation'

export default async function CreativesPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  let brand, creatives
  try {
    ;[brand, creatives] = await Promise.all([getBrand(brandId), getCreatives(brandId)])
  } catch {
    redirect('/brands')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/brands/${brandId}`} className="text-white/40 hover:text-white/70 text-sm transition-colors">
              {brand!.name}
            </Link>
            <span className="text-white/25">/</span>
            <span className="text-white/70 text-sm">Creatives</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Creative Library</h1>
        </div>
        <Link
          href={`/brands/${brandId}/creatives/new`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
        >
          ✨ Generate New
        </Link>
      </div>
      <CreativesGrid initialCreatives={creatives as any} brandId={brandId} />
    </div>
  )
}
