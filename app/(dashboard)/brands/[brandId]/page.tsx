import { getBrand } from '@/lib/db/brands'
import Link from 'next/link'
import type { BrandAsset, BrandGuideline } from '@prisma/client'

type BrandWithRelations = Awaited<ReturnType<typeof getBrand>> & {
  assets: BrandAsset[]
  guidelines: BrandGuideline[]
}

export default async function BrandProfilePage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  const brand = await getBrand(brandId) as BrandWithRelations

  const hasCompletedGuideline = brand.guidelines?.some(g => g.status === 'COMPLETED')

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {brand.primaryColor && (
              <div className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: brand.primaryColor }} />
            )}
            <h2 className="text-2xl font-bold text-gray-900">{brand.name}</h2>
          </div>
          {brand.tagline && <p className="text-gray-500 ml-11">{brand.tagline}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/brands/${brandId}/edit`} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Edit
          </Link>
          <Link href={`/brands/new/upload?brandId=${brandId}`} className="border border-brand-200 text-brand-600 px-4 py-2 rounded-lg hover:bg-brand-50 text-sm font-medium">
            Import Guidelines
          </Link>
          <Link href={`/brands/${brandId}/creatives/new`} className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 text-sm font-medium">
            Generate Creative
          </Link>
        </div>
      </div>

      {/* Colors */}
      {(brand.primaryColor || brand.secondaryColor || brand.accentColor) && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Brand Colors</h3>
          <div className="flex gap-4">
            {[
              { label: 'Primary', color: brand.primaryColor },
              { label: 'Secondary', color: brand.secondaryColor },
              { label: 'Accent', color: brand.accentColor },
            ].filter(c => c.color).map(({ label, color }) => (
              <div key={label} className="text-center">
                <div className="w-16 h-16 rounded-xl border border-gray-200 mb-2" style={{ backgroundColor: color! }} />
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xs font-mono text-gray-700">{color}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Typography */}
      {(brand.fontHeading || brand.fontBody) && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Typography</h3>
          <div className="grid grid-cols-2 gap-4">
            {brand.fontHeading && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Heading</p>
                <p className="font-medium text-gray-800">{brand.fontHeading}</p>
              </div>
            )}
            {brand.fontBody && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Body</p>
                <p className="font-medium text-gray-800">{brand.fontBody}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tone */}
      {brand.tone && brand.tone.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Tone & Voice</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(brand.tone as string[]).map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-sm bg-brand-50 text-brand-700 border border-brand-100">
                {t}
              </span>
            ))}
          </div>
          {brand.voiceGuide && (
            <p className="text-sm text-gray-600 italic border-l-2 border-brand-200 pl-3">{brand.voiceGuide}</p>
          )}
        </section>
      )}

      {/* Assets */}
      {brand.assets && brand.assets.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Assets</h3>
          <div className="space-y-2">
            {brand.assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{asset.type}</p>
                  <p className="text-xs text-gray-400">{asset.mimeType} &middot; {Math.round(asset.sizeBytes / 1024)} KB</p>
                </div>
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  View
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Guidelines */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Brand Guidelines</h3>
          <Link href={`/brands/new/upload?brandId=${brandId}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            + Import
          </Link>
        </div>
        {!brand.guidelines || brand.guidelines.length === 0 ? (
          <p className="text-sm text-gray-500">No guidelines imported yet.</p>
        ) : (
          <div className="space-y-3">
            {brand.guidelines.map(g => {
              const statusColor = {
                PENDING: 'bg-gray-100 text-gray-600',
                PROCESSING: 'bg-blue-100 text-blue-700',
                COMPLETED: 'bg-green-100 text-green-700',
                FAILED: 'bg-red-100 text-red-600',
              }[g.status]
              return (
                <div key={g.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{g.source}</p>
                    <p className="text-xs text-gray-400">{new Date(g.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>{g.status}</span>
                </div>
              )
            })}
          </div>
        )}
        {!hasCompletedGuideline && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">Import your brand guidelines to unlock AI-powered creative generation.</p>
            <Link href={`/brands/new/upload?brandId=${brandId}`} className="inline-block bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 text-sm font-medium">
              Import Guidelines
            </Link>
          </div>
        )}
      </section>

      {/* Creatives link */}
      <Link href={`/brands/${brandId}/creatives`} className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-200 hover:shadow-sm transition-all text-center">
        <p className="font-medium text-gray-800">View All Creatives</p>
        <p className="text-sm text-gray-500 mt-1">See your generated social media assets</p>
      </Link>

      {/* Generate Creative CTA */}
      <div className="flex justify-end">
        <Link href={`/brands/${brandId}/creatives/new`} className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 font-medium">
          Generate Creative
        </Link>
      </div>
    </div>
  )
}
