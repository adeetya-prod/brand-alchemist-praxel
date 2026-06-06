import { getCreatives } from '@/lib/db/creatives'
import { getBrand } from '@/lib/db/brands'
import Link from 'next/link'
import CreativesGrid from '@/components/creatives/CreativesGrid'

export default async function CreativesPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  const [brand, creatives] = await Promise.all([getBrand(brandId), getCreatives(brandId)])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Creatives</h2>
          <p className="text-gray-500 text-sm mt-1">{brand.name}</p>
        </div>
        <Link href={`/brands/${brandId}/creatives/new`} className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 text-sm font-medium">
          + Generate New
        </Link>
      </div>
      <CreativesGrid initialCreatives={creatives as any} brandId={brandId} />
    </div>
  )
}
