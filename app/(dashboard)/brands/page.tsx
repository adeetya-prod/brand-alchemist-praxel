import { getBrands } from '@/lib/db/brands'
import { BRAND_SPACE, BRAND_SPACES } from '@/lib/copy'
import Link from 'next/link'

export default async function DashboardPage() {
  const brands = await getBrands()
  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white">{BRAND_SPACES}</h1>
          <p className="mt-1 text-white/45">Your brand identities, all in one place</p>
        </div>
        <Link
          href="/brands/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
        >
          <span className="text-base leading-none">+</span> New {BRAND_SPACE}
        </Link>
      </div>

      {brands.length === 0 ? (
        <div
          className="rounded-3xl p-16 text-center"
          style={{ border: '2px dashed rgba(255,255,255,0.1)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(255,107,107,0.2))' }}
          >
            🧪
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No brand spaces yet</h3>
          <p className="text-white/45 mb-8 max-w-sm mx-auto">
            Create your first brand identity to start generating on-brand creative assets
          </p>
          <Link
            href="/brands/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #FF6B6B)' }}
          >
            Create Brand Space
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map(brand => {
            const primary = brand.primaryColor || '#7C3AED'
            const secondary = brand.secondaryColor || '#4C1D95'
            return (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div
                  className="h-24 w-full"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                />
                <div className="p-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="font-semibold text-white">{brand.name}</p>
                  {brand.tagline && (
                    <p className="text-sm text-white/50 mt-0.5 truncate">{brand.tagline}</p>
                  )}
                  {brand.tone && (brand.tone as string[]).length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {(brand.tone as string[]).slice(0, 3).map(t => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full text-white/55"
                          style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}

          <Link
            href="/brands/new"
            className="rounded-2xl flex items-center justify-center min-h-[160px] transition-all group"
            style={{ border: '2px dashed rgba(255,255,255,0.12)' }}
          >
            <div className="text-center">
              <div className="text-3xl text-white/20 group-hover:text-brand-400 transition-colors mb-1">+</div>
              <p className="text-sm text-white/35 group-hover:text-white/60 transition-colors">New Brand Space</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
