import { getBrand } from '@/lib/db/brands'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { BrandAsset, BrandGuideline } from '@prisma/client'

type BrandWithRelations = Awaited<ReturnType<typeof getBrand>> & {
  assets: BrandAsset[]
  guidelines: BrandGuideline[]
}

const CARD = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }

export default async function BrandProfilePage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params
  let brand: BrandWithRelations
  try {
    brand = await getBrand(brandId) as BrandWithRelations
  } catch {
    redirect('/brands')
  }

  const hasCompletedGuideline = brand.guidelines?.some(g => g.status === 'COMPLETED')

  const pendingReview = await prisma.brandGuideline.findFirst({
    where: { brandId, status: 'COMPLETED', extractedData: { not: null } } as any,
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  })

  const primary = brand.primaryColor || '#7C3AED'
  const secondary = brand.secondaryColor || '#4C1D95'

  return (
    <div className="max-w-3xl space-y-6">
      {/* Pending extraction review banner */}
      {pendingReview && (
        <div
          className="flex items-center justify-between rounded-xl px-5 py-3"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <p className="text-sm font-medium text-brand-300">Extracted brand data is awaiting your review.</p>
          </div>
          <Link href={`/brands/new/upload?brandId=${brandId}`} className="text-xs font-semibold text-brand-300 hover:text-white transition-colors">
            Review now →
          </Link>
        </div>
      )}

      {/* Hero header */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-32 w-full" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
        <div className="px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{brand.name}</h1>
              {brand.tagline && <p className="text-white/50 mt-0.5">{brand.tagline}</p>}
            </div>
            <div className="flex gap-2 mt-1">
              <Link
                href={`/brands/${brandId}/edit`}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-white/60 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Edit
              </Link>
              <Link
                href={`/brands/new/upload?brandId=${brandId}`}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-brand-300 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.1)' }}
              >
                Import Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/brands/${brandId}/creatives/new`}
          className="rounded-2xl p-5 flex items-center gap-4 group transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(255,107,107,0.1))', border: '1px solid rgba(124,58,237,0.25)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(124,58,237,0.25)' }}>✨</div>
          <div>
            <p className="font-semibold text-white text-sm">Generate Creative</p>
            <p className="text-xs text-white/45 mt-0.5">Instagram, LinkedIn &amp; more</p>
          </div>
        </Link>
        <Link
          href={`/brands/${brandId}/creatives`}
          className="rounded-2xl p-5 flex items-center gap-4 group transition-all hover:-translate-y-0.5"
          style={CARD}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>🖼</div>
          <div>
            <p className="font-semibold text-white text-sm">Creative Library</p>
            <p className="text-xs text-white/45 mt-0.5">View all generated assets</p>
          </div>
        </Link>
      </div>

      {/* Colors */}
      {(brand.primaryColor || brand.secondaryColor || brand.accentColor) && (
        <section className="rounded-2xl p-6" style={CARD}>
          <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wide mb-4">Brand Colors</h3>
          <div className="flex gap-5">
            {[
              { label: 'Primary', color: brand.primaryColor },
              { label: 'Secondary', color: brand.secondaryColor },
              { label: 'Accent', color: brand.accentColor },
            ].filter(c => c.color).map(({ label, color }) => (
              <div key={label} className="text-center">
                <div className="w-14 h-14 rounded-xl mb-2" style={{ backgroundColor: color!, border: '1px solid rgba(255,255,255,0.15)' }} />
                <p className="text-xs text-white/40">{label}</p>
                <p className="text-xs font-mono text-white/65">{color}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Typography */}
      {(brand.fontHeading || brand.fontBody) && (
        <section className="rounded-2xl p-6" style={CARD}>
          <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wide mb-4">Typography</h3>
          <div className="grid grid-cols-2 gap-4">
            {brand.fontHeading && (
              <div>
                <p className="text-xs text-white/40 mb-1">Heading</p>
                <p className="font-medium text-white">{brand.fontHeading}</p>
              </div>
            )}
            {brand.fontBody && (
              <div>
                <p className="text-xs text-white/40 mb-1">Body</p>
                <p className="font-medium text-white">{brand.fontBody}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tone */}
      {brand.tone && (brand.tone as string[]).length > 0 && (
        <section className="rounded-2xl p-6" style={CARD}>
          <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wide mb-4">Tone & Voice</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(brand.tone as string[]).map(t => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-sm"
                style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                {t}
              </span>
            ))}
          </div>
          {brand.voiceGuide && (
            <p className="text-sm text-white/50 italic leading-relaxed"
               style={{ borderLeft: '2px solid rgba(124,58,237,0.4)', paddingLeft: '12px' }}>
              {brand.voiceGuide}
            </p>
          )}
        </section>
      )}

      {/* Guidelines */}
      <section className="rounded-2xl p-6" style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wide">Brand Guidelines</h3>
          <Link href={`/brands/new/upload?brandId=${brandId}`} className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
            + Import
          </Link>
        </div>
        {!brand.guidelines || brand.guidelines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/35 mb-4">No guidelines imported yet.</p>
            <Link
              href={`/brands/new/upload?brandId=${brandId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
            >
              Import Guidelines
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {brand.guidelines.map(g => {
              const statusStyle = {
                PENDING: { color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)' },
                PROCESSING: { color: '#93C5FD', background: 'rgba(59,130,246,0.15)' },
                COMPLETED: { color: '#86EFAC', background: 'rgba(34,197,94,0.15)' },
                FAILED: { color: '#FCA5A5', background: 'rgba(239,68,68,0.15)' },
              }[g.status] || { color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)' }
              return (
                <div key={g.id} className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div>
                    <p className="text-sm font-medium text-white/80">{g.source}</p>
                    <p className="text-xs text-white/35">{new Date(g.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={statusStyle}>{g.status}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Assets */}
      {brand.assets && brand.assets.length > 0 && (
        <section className="rounded-2xl p-6" style={CARD}>
          <h3 className="font-semibold text-white/70 text-sm uppercase tracking-wide mb-4">Assets</h3>
          <div className="space-y-2">
            {brand.assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between py-2.5 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div>
                  <p className="text-sm font-medium text-white/80">{asset.type}</p>
                  <p className="text-xs text-white/35">{asset.mimeType} · {Math.round(asset.sizeBytes / 1024)} KB</p>
                </div>
                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  View
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
