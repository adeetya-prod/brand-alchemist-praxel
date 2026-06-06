import { getBrands } from '@/lib/db/brands'
import Link from 'next/link'

export default async function DashboardPage() {
  const brands = await getBrands()
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Your Brands</h2>
        <Link href="/brands/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          + New Brand
        </Link>
      </div>
      {brands.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No brands yet. Create your first brand identity.</p>
          <Link href="/brands/new" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium">
            Create Brand
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {brands.map(brand => (
            <Link key={brand.id} href={`/brands/${brand.id}`} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                {brand.primaryColor && <div className="w-10 h-10 rounded-full border border-gray-200" style={{ backgroundColor: brand.primaryColor }} />}
                <div>
                  <p className="font-semibold text-gray-900">{brand.name}</p>
                  {brand.tagline && <p className="text-sm text-gray-500">{brand.tagline}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
