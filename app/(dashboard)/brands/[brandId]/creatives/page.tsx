import { getCreatives } from '@/lib/db/creatives'
import { getBrand } from '@/lib/db/brands'
import Link from 'next/link'
import CreativeCard from '@/components/creatives/CreativeCard'

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
        <Link href={`/brands/${brandId}/creatives/new`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          + Generate New
        </Link>
      </div>
      {creatives.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No creatives generated yet.</p>
          <Link href={`/brands/${brandId}/creatives/new`} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">
            Generate First Creative
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatives.map(creative => (
            <CreativeCard key={creative.id} creative={creative} brandId={brandId} />
          ))}
        </div>
      )}
    </div>
  )
}
